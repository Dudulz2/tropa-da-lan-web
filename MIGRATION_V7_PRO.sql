-- Tropa da Lan V7 PRO
-- Execute APÓS supabase_v4.sql + MIGRATION_V6_ULTIMATE.sql.
-- Migração aditiva/idempotente para recursos V7.

begin;

-- ---------------------------------------------------------------------------
-- Preferências avançadas
-- ---------------------------------------------------------------------------
alter table public.user_preferences add column if not exists audio_output_id text;
alter table public.user_preferences add column if not exists push_to_talk boolean not null default false;
alter table public.user_preferences add column if not exists push_to_talk_key text not null default 'Space';
alter table public.user_preferences add column if not exists voice_sensitivity integer not null default 45;
alter table public.user_preferences add column if not exists screen_quality text not null default '1080p';
alter table public.user_preferences add column if not exists screen_fps integer not null default 30;
alter table public.user_preferences add column if not exists stream_mode text not null default 'balanced';
alter table public.user_preferences add column if not exists low_bandwidth boolean not null default false;
alter table public.user_preferences add column if not exists notification_level text not null default 'mentions';

do $$
begin
  if not exists (select 1 from pg_constraint where conname='user_preferences_voice_sensitivity_check' and conrelid='public.user_preferences'::regclass) then
    alter table public.user_preferences add constraint user_preferences_voice_sensitivity_check check (voice_sensitivity between 5 and 95);
  end if;
  if not exists (select 1 from pg_constraint where conname='user_preferences_screen_quality_check' and conrelid='public.user_preferences'::regclass) then
    alter table public.user_preferences add constraint user_preferences_screen_quality_check check (screen_quality in ('720p','1080p','1440p'));
  end if;
  if not exists (select 1 from pg_constraint where conname='user_preferences_screen_fps_check' and conrelid='public.user_preferences'::regclass) then
    alter table public.user_preferences add constraint user_preferences_screen_fps_check check (screen_fps in (15,30,60));
  end if;
  if not exists (select 1 from pg_constraint where conname='user_preferences_stream_mode_check' and conrelid='public.user_preferences'::regclass) then
    alter table public.user_preferences add constraint user_preferences_stream_mode_check check (stream_mode in ('quality','balanced','fluidity'));
  end if;
  if not exists (select 1 from pg_constraint where conname='user_preferences_notification_level_check' and conrelid='public.user_preferences'::regclass) then
    alter table public.user_preferences add constraint user_preferences_notification_level_check check (notification_level in ('all','mentions','none'));
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Servidores, canais e membros
-- ---------------------------------------------------------------------------
alter table public.servers add column if not exists banner_url text;
alter table public.servers add column if not exists accent_color text not null default '#1D8DFF';
alter table public.channels add column if not exists category text not null default 'Geral';
alter table public.channels add column if not exists is_private boolean not null default false;
alter table public.channels add column if not exists allowed_role_ids uuid[] not null default '{}';
alter table public.channels add column if not exists read_only boolean not null default false;
alter table public.channels add column if not exists slowmode_seconds integer not null default 0;
alter table public.server_members add column if not exists timeout_until timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname='servers_accent_color_hex_v7' and conrelid='public.servers'::regclass) then
    alter table public.servers add constraint servers_accent_color_hex_v7 check (accent_color ~ '^#[0-9A-Fa-f]{6}$');
  end if;
  if not exists (select 1 from pg_constraint where conname='channels_category_len_v7' and conrelid='public.channels'::regclass) then
    alter table public.channels add constraint channels_category_len_v7 check (char_length(category) between 1 and 32);
  end if;
  if not exists (select 1 from pg_constraint where conname='channels_slowmode_v7' and conrelid='public.channels'::regclass) then
    alter table public.channels add constraint channels_slowmode_v7 check (slowmode_seconds between 0 and 21600);
  end if;
end $$;

create index if not exists channels_server_category_position_v7_idx on public.channels(server_id, category, position, created_at);
create index if not exists server_members_timeout_v7_idx on public.server_members(server_id, timeout_until) where timeout_until is not null;

-- ---------------------------------------------------------------------------
-- Enquetes: múltipla escolha real
-- ---------------------------------------------------------------------------
alter table public.poll_votes drop constraint if exists poll_votes_pkey;
alter table public.poll_votes add constraint poll_votes_pkey primary key(message_id,user_id,option_index);

-- ---------------------------------------------------------------------------
-- Notificações por servidor
-- ---------------------------------------------------------------------------
create table if not exists public.server_notification_settings (
  server_id uuid not null references public.servers(id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  level text not null default 'mentions' check (level in ('all','mentions','none')),
  updated_at timestamptz not null default now(),
  primary key(server_id,user_id)
);
alter table public.server_notification_settings enable row level security;
drop policy if exists server_notifications_self_select on public.server_notification_settings;
create policy server_notifications_self_select on public.server_notification_settings for select to authenticated using (user_id=auth.uid() and public.is_server_member(server_id,auth.uid()));
drop policy if exists server_notifications_self_insert on public.server_notification_settings;
create policy server_notifications_self_insert on public.server_notification_settings for insert to authenticated with check (user_id=auth.uid() and public.is_server_member(server_id,auth.uid()));
drop policy if exists server_notifications_self_update on public.server_notification_settings;
create policy server_notifications_self_update on public.server_notification_settings for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
drop policy if exists server_notifications_self_delete on public.server_notification_settings;
create policy server_notifications_self_delete on public.server_notification_settings for delete to authenticated using (user_id=auth.uid());

-- ---------------------------------------------------------------------------
-- Advertências
-- ---------------------------------------------------------------------------
create table if not exists public.member_warnings (
  id bigint generated by default as identity primary key,
  server_id uuid not null references public.servers(id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  warned_by uuid not null references public.profiles(user_id) on delete cascade,
  reason text not null default '',
  created_at timestamptz not null default now(),
  constraint member_warnings_reason_len_v7 check (char_length(reason) <= 500)
);
create index if not exists member_warnings_server_user_v7_idx on public.member_warnings(server_id,user_id,created_at desc);
alter table public.member_warnings enable row level security;
drop policy if exists member_warnings_read_managers_v7 on public.member_warnings;
create policy member_warnings_read_managers_v7 on public.member_warnings for select to authenticated using (
  public.has_server_permission(server_id,'KICK_MEMBERS',auth.uid()) or user_id=auth.uid()
);

-- ---------------------------------------------------------------------------
-- Hierarquia de cargos
-- ---------------------------------------------------------------------------
create or replace function public.highest_role_position(p_server_id uuid, p_user_id uuid default auth.uid())
returns integer
language sql
stable
security definer
set search_path=public
as $$
  select case
    when exists(select 1 from public.servers s where s.id=p_server_id and s.owner_id=p_user_id) then 2147483647
    else coalesce((
      select max(r.position)
      from public.roles r
      where r.server_id=p_server_id
        and (
          r.is_default=true
          or exists(select 1 from public.member_roles mr where mr.server_id=p_server_id and mr.user_id=p_user_id and mr.role_id=r.id)
        )
    ),-1)
  end;
$$;

create or replace function public.can_manage_role(p_role_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select exists(
    select 1 from public.roles r
    where r.id=p_role_id
      and r.is_default=false
      and public.has_server_permission(r.server_id,'MANAGE_ROLES',p_user_id)
      and public.highest_role_position(r.server_id,p_user_id) > r.position
  );
$$;

revoke all on function public.highest_role_position(uuid,uuid) from public;
revoke all on function public.can_manage_role(uuid,uuid) from public;
grant execute on function public.highest_role_position(uuid,uuid) to authenticated;
grant execute on function public.can_manage_role(uuid,uuid) to authenticated;

-- Reforça políticas de cargo sem bloquear o dono.
drop policy if exists roles_insert_managers on public.roles;
create policy roles_insert_managers on public.roles for insert to authenticated with check (
  public.has_server_permission(server_id,'MANAGE_ROLES',auth.uid())
  and position < public.highest_role_position(server_id,auth.uid())
  and is_default=false
);
drop policy if exists roles_update_managers on public.roles;
create policy roles_update_managers on public.roles for update to authenticated
using (public.can_manage_role(id,auth.uid()))
with check (public.has_server_permission(server_id,'MANAGE_ROLES',auth.uid()) and position < public.highest_role_position(server_id,auth.uid()));
drop policy if exists roles_delete_managers on public.roles;
create policy roles_delete_managers on public.roles for delete to authenticated using (public.can_manage_role(id,auth.uid()));

drop policy if exists member_roles_insert_managers on public.member_roles;
create policy member_roles_insert_managers on public.member_roles for insert to authenticated with check (
  public.is_server_member(server_id,user_id)
  and public.can_manage_role(role_id,auth.uid())
);
drop policy if exists member_roles_delete_managers on public.member_roles;
create policy member_roles_delete_managers on public.member_roles for delete to authenticated using (public.can_manage_role(role_id,auth.uid()));

-- ---------------------------------------------------------------------------
-- Canais privados: autorização real no banco, não apenas na interface
-- ---------------------------------------------------------------------------
create or replace function public.can_view_channel(p_channel_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select exists(
    select 1
    from public.channels c
    where c.id=p_channel_id
      and public.is_server_member(c.server_id,p_user_id)
      and public.has_server_permission(c.server_id,'VIEW_CHANNEL',p_user_id)
      and (
        c.is_private=false
        or exists(select 1 from public.servers s where s.id=c.server_id and s.owner_id=p_user_id)
        or public.has_server_permission(c.server_id,'MANAGE_CHANNELS',p_user_id)
        or exists(
          select 1 from public.member_roles mr
          where mr.server_id=c.server_id and mr.user_id=p_user_id and mr.role_id=any(c.allowed_role_ids)
        )
      )
  );
$$;
revoke all on function public.can_view_channel(uuid,uuid) from public;
grant execute on function public.can_view_channel(uuid,uuid) to authenticated;

-- canais
drop policy if exists channels_read_members on public.channels;
create policy channels_read_members on public.channels for select to authenticated using (public.can_view_channel(id,auth.uid()));

-- mensagens
drop policy if exists channel_messages_read_members on public.channel_messages;
create policy channel_messages_read_members on public.channel_messages for select to authenticated using (public.can_view_channel(channel_id,auth.uid()));

drop policy if exists channel_messages_insert_members on public.channel_messages;
create policy channel_messages_insert_members on public.channel_messages for insert to authenticated with check (
  user_id=auth.uid()
  and exists(
    select 1 from public.channels c
    join public.server_members sm on sm.server_id=c.server_id and sm.user_id=auth.uid()
    where c.id=channel_id
      and c.type='text'
      and public.can_view_channel(c.id,auth.uid())
      and public.has_server_permission(c.server_id,'SEND_MESSAGES',auth.uid())
      and (c.read_only=false or public.has_server_permission(c.server_id,'MANAGE_MESSAGES',auth.uid()))
      and (sm.timeout_until is null or sm.timeout_until <= now())
      and (
        c.slowmode_seconds=0
        or public.has_server_permission(c.server_id,'MANAGE_MESSAGES',auth.uid())
        or not exists(
          select 1 from public.channel_messages oldm
          where oldm.channel_id=c.id and oldm.user_id=auth.uid()
            and oldm.created_at > now() - make_interval(secs => c.slowmode_seconds)
        )
      )
  )
);

-- atualizações/exclusões continuam próprias/gerenciáveis, mas exigem visibilidade
drop policy if exists channel_messages_update_own on public.channel_messages;
create policy channel_messages_update_own on public.channel_messages for update to authenticated
using (user_id=auth.uid() and public.can_view_channel(channel_id,auth.uid()))
with check (user_id=auth.uid() and public.can_view_channel(channel_id,auth.uid()));
drop policy if exists channel_messages_delete_own_or_manage on public.channel_messages;
create policy channel_messages_delete_own_or_manage on public.channel_messages for delete to authenticated using (
  public.can_view_channel(channel_id,auth.uid()) and (
    user_id=auth.uid() or exists(select 1 from public.channels c where c.id=channel_id and public.has_server_permission(c.server_id,'MANAGE_MESSAGES',auth.uid()))
  )
);

-- reações
drop policy if exists message_reactions_read_members on public.message_reactions;
create policy message_reactions_read_members on public.message_reactions for select to authenticated using (
  exists(select 1 from public.channel_messages m where m.id=message_id and public.can_view_channel(m.channel_id,auth.uid()))
);
drop policy if exists message_reactions_insert_self on public.message_reactions;
create policy message_reactions_insert_self on public.message_reactions for insert to authenticated with check (
  user_id=auth.uid() and exists(select 1 from public.channel_messages m where m.id=message_id and public.can_view_channel(m.channel_id,auth.uid()))
);

-- votos
drop policy if exists poll_votes_read_members on public.poll_votes;
create policy poll_votes_read_members on public.poll_votes for select to authenticated using (
  exists(select 1 from public.channel_messages m where m.id=message_id and m.kind='poll' and public.can_view_channel(m.channel_id,auth.uid()))
);
drop policy if exists poll_votes_insert_self on public.poll_votes;
create policy poll_votes_insert_self on public.poll_votes for insert to authenticated with check (
  user_id=auth.uid() and exists(select 1 from public.channel_messages m where m.id=message_id and m.kind='poll' and public.can_view_channel(m.channel_id,auth.uid()))
);

-- ---------------------------------------------------------------------------
-- RPCs de moderação V7
-- ---------------------------------------------------------------------------
create or replace function public.warn_server_member(p_server_id uuid, p_user_id uuid, p_reason text default '')
returns bigint
language plpgsql
security definer
set search_path=public
as $$
declare v_id bigint;
begin
  if auth.uid() is null then raise exception 'Não autenticado'; end if;
  if not public.has_server_permission(p_server_id,'KICK_MEMBERS',auth.uid()) then raise exception 'Sem permissão'; end if;
  if not public.is_server_member(p_server_id,p_user_id) then raise exception 'Membro não encontrado'; end if;
  if exists(select 1 from public.servers where id=p_server_id and owner_id=p_user_id) then raise exception 'O dono não pode receber esta ação'; end if;
  if public.highest_role_position(p_server_id,p_user_id) >= public.highest_role_position(p_server_id,auth.uid()) then raise exception 'Você não pode moderar um membro de hierarquia igual ou superior'; end if;
  insert into public.member_warnings(server_id,user_id,warned_by,reason)
  values(p_server_id,p_user_id,auth.uid(),left(coalesce(p_reason,''),500)) returning id into v_id;
  insert into public.server_audit_log(server_id,actor_id,action,target_user_id,metadata)
  values(p_server_id,auth.uid(),'warn_member',p_user_id,jsonb_build_object('reason',left(coalesce(p_reason,''),500)));
  return v_id;
end;
$$;

create or replace function public.timeout_server_member(p_server_id uuid, p_user_id uuid, p_minutes integer, p_reason text default '')
returns timestamptz
language plpgsql
security definer
set search_path=public
as $$
declare v_until timestamptz;
begin
  if auth.uid() is null then raise exception 'Não autenticado'; end if;
  if not public.has_server_permission(p_server_id,'KICK_MEMBERS',auth.uid()) then raise exception 'Sem permissão'; end if;
  if not public.is_server_member(p_server_id,p_user_id) then raise exception 'Membro não encontrado'; end if;
  if exists(select 1 from public.servers where id=p_server_id and owner_id=p_user_id) then raise exception 'O dono não pode receber timeout'; end if;
  if public.highest_role_position(p_server_id,p_user_id) >= public.highest_role_position(p_server_id,auth.uid()) then raise exception 'Você não pode moderar um membro de hierarquia igual ou superior'; end if;
  if p_minutes < 0 or p_minutes > 40320 then raise exception 'Duração inválida'; end if;
  v_until := case when p_minutes=0 then null else now()+make_interval(mins=>p_minutes) end;
  update public.server_members set timeout_until=v_until where server_id=p_server_id and user_id=p_user_id;
  insert into public.server_audit_log(server_id,actor_id,action,target_user_id,metadata)
  values(p_server_id,auth.uid(),case when v_until is null then 'remove_timeout' else 'timeout_member' end,p_user_id,
         jsonb_build_object('minutes',p_minutes,'reason',left(coalesce(p_reason,''),500),'until',v_until));
  return v_until;
end;
$$;

revoke all on function public.warn_server_member(uuid,uuid,text) from public;
revoke all on function public.timeout_server_member(uuid,uuid,integer,text) from public;
grant execute on function public.warn_server_member(uuid,uuid,text) to authenticated;
grant execute on function public.timeout_server_member(uuid,uuid,integer,text) to authenticated;

-- ---------------------------------------------------------------------------
-- Endurecimento adicional de moderação V7.0.6
-- ---------------------------------------------------------------------------
create or replace function public.can_moderate_member(p_server_id uuid, p_target_id uuid, p_actor_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path=public as $$
  select p_actor_id is not null and p_target_id is not null and p_actor_id<>p_target_id
    and public.is_server_member(p_server_id,p_target_id)
    and not exists(select 1 from public.servers s where s.id=p_server_id and s.owner_id=p_target_id)
    and (exists(select 1 from public.servers s where s.id=p_server_id and s.owner_id=p_actor_id)
      or (public.has_server_permission(p_server_id,'KICK_MEMBERS',p_actor_id)
          and public.highest_role_position(p_server_id,p_actor_id)>public.highest_role_position(p_server_id,p_target_id)));
$$;
revoke all on function public.can_moderate_member(uuid,uuid,uuid) from public;
grant execute on function public.can_moderate_member(uuid,uuid,uuid) to authenticated;

drop policy if exists members_delete_self_or_kick on public.server_members;
create policy members_delete_self_or_kick on public.server_members for delete to authenticated using (
  not exists(select 1 from public.servers s where s.id=server_id and s.owner_id=user_id)
  and (user_id=auth.uid() or public.can_moderate_member(server_id,user_id,auth.uid()))
);

create or replace function public.ban_server_member(p_server_id uuid, p_user_id uuid, p_reason text default '')
returns boolean language plpgsql security definer set search_path=public as $$
declare v_me uuid := auth.uid();
begin
  if v_me is null then raise exception 'Autenticação necessária.' using errcode='42501'; end if;
  if not public.can_moderate_member(p_server_id,p_user_id,v_me) then raise exception 'Você não pode banir este membro.' using errcode='42501'; end if;
  insert into public.server_bans(server_id,user_id,banned_by,reason) values(p_server_id,p_user_id,v_me,left(coalesce(p_reason,''),300))
    on conflict(server_id,user_id) do update set banned_by=excluded.banned_by,reason=excluded.reason,created_at=now();
  delete from public.server_members where server_id=p_server_id and user_id=p_user_id;
  insert into public.server_audit_log(server_id,actor_id,action,target_user_id,metadata) values(p_server_id,v_me,'MEMBER_BAN',p_user_id,jsonb_build_object('reason',left(coalesce(p_reason,''),300)));
  return true;
end; $$;
revoke all on function public.ban_server_member(uuid,uuid,text) from public;
grant execute on function public.ban_server_member(uuid,uuid,text) to authenticated;

-- Reload PostgREST schema cache
notify pgrst, 'reload schema';

commit;

select
  'Tropa V7 PRO instalada' as status,
  to_regprocedure('public.can_view_channel(uuid,uuid)') is not null as private_channels_ok,
  to_regprocedure('public.warn_server_member(uuid,uuid,text)') is not null as warnings_ok,
  to_regprocedure('public.timeout_server_member(uuid,uuid,integer,text)') is not null as timeout_ok,
  to_regclass('public.server_notification_settings') is not null as notifications_ok;
