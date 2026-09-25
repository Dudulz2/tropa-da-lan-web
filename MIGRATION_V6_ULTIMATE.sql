-- =============================================================
-- TROPA DA LAN WEB V6 ULTIMATE
-- Migração aditiva. Não apaga servidores, usuários ou mensagens.
-- Execute uma única vez no Supabase > SQL Editor.
-- =============================================================

begin;

create extension if not exists pgcrypto;

-- ---------- Perfis / preferências ----------
alter table public.profiles add column if not exists banner_url text;
alter table public.profiles add column if not exists presence_mode text not null default 'online';

-- Evita erro se a constraint já existir.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_presence_mode_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_presence_mode_check
      check (presence_mode in ('online','idle','dnd','invisible'));
  end if;
end $$;

create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  theme_mode text not null default 'neon' check (theme_mode in ('neon','midnight','oled')),
  accent_color text not null default '#1D8DFF',
  density text not null default 'comfortable' check (density in ('comfortable','compact')),
  reduce_motion boolean not null default false,
  browser_notifications boolean not null default false,
  sounds_enabled boolean not null default true,
  audio_input_id text,
  video_input_id text,
  updated_at timestamptz not null default now(),
  constraint user_preferences_accent_hex check (accent_color ~ '^#[0-9A-Fa-f]{6}$')
);


alter table public.user_preferences add column if not exists audio_input_id text;
alter table public.user_preferences add column if not exists video_input_id text;

drop trigger if exists user_preferences_set_updated_at on public.user_preferences;
create trigger user_preferences_set_updated_at
before update on public.user_preferences
for each row execute function public.set_updated_at();

-- ---------- Mensagens avançadas ----------
alter table public.channel_messages add column if not exists attachments jsonb not null default '[]'::jsonb;
alter table public.channel_messages add column if not exists kind text not null default 'text';
alter table public.channel_messages add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.channel_messages add column if not exists pinned boolean not null default false;
alter table public.channel_messages add column if not exists pinned_by uuid references public.profiles(user_id) on delete set null;
alter table public.channel_messages add column if not exists pinned_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'channel_messages_kind_check'
      and conrelid = 'public.channel_messages'::regclass
  ) then
    alter table public.channel_messages
      add constraint channel_messages_kind_check
      check (kind in ('text','poll','system'));
  end if;
end $$;

create index if not exists channel_messages_pinned_idx
on public.channel_messages(channel_id, pinned_at desc)
where pinned = true;

create table if not exists public.message_reactions (
  message_id bigint not null references public.channel_messages(id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  primary key(message_id, user_id, emoji),
  constraint message_reactions_emoji_len check (char_length(emoji) between 1 and 16)
);
create index if not exists message_reactions_message_idx on public.message_reactions(message_id);

create table if not exists public.poll_votes (
  message_id bigint not null references public.channel_messages(id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  option_index integer not null check (option_index between 0 and 5),
  created_at timestamptz not null default now(),
  primary key(message_id, user_id)
);
create index if not exists poll_votes_message_idx on public.poll_votes(message_id);

-- ---------- Social / amizades / DM ----------
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(user_id) on delete cascade,
  addressee_id uuid not null references public.profiles(user_id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint friendships_not_self check (requester_id <> addressee_id)
);
create unique index if not exists friendships_pair_unique_idx
on public.friendships(least(requester_id, addressee_id), greatest(requester_id, addressee_id));
create index if not exists friendships_requester_idx on public.friendships(requester_id, status);
create index if not exists friendships_addressee_idx on public.friendships(addressee_id, status);

drop trigger if exists friendships_set_updated_at on public.friendships;
create trigger friendships_set_updated_at
before update on public.friendships
for each row execute function public.set_updated_at();

create table if not exists public.direct_messages (
  id bigint generated by default as identity primary key,
  sender_id uuid not null references public.profiles(user_id) on delete cascade,
  recipient_id uuid not null references public.profiles(user_id) on delete cascade,
  content text not null default '',
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  read_at timestamptz,
  constraint direct_messages_not_self check (sender_id <> recipient_id),
  constraint direct_messages_content_len check (char_length(content) <= 2000),
  constraint direct_messages_has_payload check (char_length(btrim(content)) > 0 or jsonb_array_length(attachments) > 0)
);
create index if not exists direct_messages_sender_recipient_idx on public.direct_messages(sender_id, recipient_id, created_at desc);
create index if not exists direct_messages_recipient_sender_idx on public.direct_messages(recipient_id, sender_id, created_at desc);

create or replace function public.protect_direct_message_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.sender_id <> old.sender_id or new.recipient_id <> old.recipient_id or new.created_at <> old.created_at then
    raise exception 'Remetente, destinatário e data da DM não podem ser alterados.' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_direct_message_update_trigger on public.direct_messages;
create trigger protect_direct_message_update_trigger
before update on public.direct_messages
for each row execute function public.protect_direct_message_update();

-- ---------- Eventos ----------
create table if not exists public.server_events (
  id uuid primary key default gen_random_uuid(),
  server_id uuid not null references public.servers(id) on delete cascade,
  created_by uuid not null references public.profiles(user_id) on delete cascade,
  title text not null,
  description text not null default '',
  starts_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint server_events_title_len check (char_length(title) between 1 and 80),
  constraint server_events_description_len check (char_length(description) <= 500)
);
create index if not exists server_events_server_starts_idx on public.server_events(server_id, starts_at);

create table if not exists public.event_rsvps (
  event_id uuid not null references public.server_events(id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  response text not null default 'going' check (response in ('going','maybe','declined')),
  created_at timestamptz not null default now(),
  primary key(event_id, user_id)
);

-- ---------- Moderação ----------
create table if not exists public.server_bans (
  server_id uuid not null references public.servers(id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  banned_by uuid not null references public.profiles(user_id) on delete cascade,
  reason text not null default '',
  created_at timestamptz not null default now(),
  primary key(server_id, user_id),
  constraint server_bans_reason_len check (char_length(reason) <= 300)
);

create table if not exists public.server_audit_log (
  id bigint generated by default as identity primary key,
  server_id uuid not null references public.servers(id) on delete cascade,
  actor_id uuid references public.profiles(user_id) on delete set null,
  action text not null,
  target_user_id uuid references public.profiles(user_id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists server_audit_log_server_created_idx on public.server_audit_log(server_id, created_at desc);

-- Protege colunas sensíveis das mensagens contra alteração direta indevida.
create or replace function public.protect_channel_message_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_server uuid;
begin
  if new.user_id <> old.user_id or new.channel_id <> old.channel_id or new.created_at <> old.created_at then
    raise exception 'Campos imutáveis da mensagem não podem ser alterados.' using errcode = '42501';
  end if;
  if (new.pinned, new.pinned_by, new.pinned_at) is distinct from (old.pinned, old.pinned_by, old.pinned_at) then
    select server_id into v_server from public.channels where id = old.channel_id;
    if not public.has_server_permission(v_server, 'MANAGE_MESSAGES', auth.uid())
       and not public.has_server_permission(v_server, 'ADMINISTRATOR', auth.uid()) then
      raise exception 'Somente moderadores podem alterar pins.' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_channel_message_update_trigger on public.channel_messages;
create trigger protect_channel_message_update_trigger
before update on public.channel_messages
for each row execute function public.protect_channel_message_update();

-- ---------- RLS ----------
alter table public.user_preferences enable row level security;
alter table public.message_reactions enable row level security;
alter table public.poll_votes enable row level security;
alter table public.friendships enable row level security;
alter table public.direct_messages enable row level security;
alter table public.server_events enable row level security;
alter table public.event_rsvps enable row level security;
alter table public.server_bans enable row level security;
alter table public.server_audit_log enable row level security;

-- Preferências
DROP POLICY IF EXISTS user_preferences_self_select ON public.user_preferences;
CREATE POLICY user_preferences_self_select ON public.user_preferences FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS user_preferences_self_insert ON public.user_preferences;
CREATE POLICY user_preferences_self_insert ON public.user_preferences FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS user_preferences_self_update ON public.user_preferences;
CREATE POLICY user_preferences_self_update ON public.user_preferences FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Reações
DROP POLICY IF EXISTS message_reactions_read_members ON public.message_reactions;
CREATE POLICY message_reactions_read_members ON public.message_reactions FOR SELECT TO authenticated USING (
  exists (
    select 1 from public.channel_messages m
    join public.channels c on c.id = m.channel_id
    where m.id = message_id and public.is_server_member(c.server_id)
  )
);
DROP POLICY IF EXISTS message_reactions_insert_self ON public.message_reactions;
CREATE POLICY message_reactions_insert_self ON public.message_reactions FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() and exists (
    select 1 from public.channel_messages m
    join public.channels c on c.id = m.channel_id
    where m.id = message_id and public.is_server_member(c.server_id)
  )
);
DROP POLICY IF EXISTS message_reactions_delete_self ON public.message_reactions;
CREATE POLICY message_reactions_delete_self ON public.message_reactions FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Enquetes
DROP POLICY IF EXISTS poll_votes_read_members ON public.poll_votes;
CREATE POLICY poll_votes_read_members ON public.poll_votes FOR SELECT TO authenticated USING (
  exists (
    select 1 from public.channel_messages m
    join public.channels c on c.id = m.channel_id
    where m.id = message_id and m.kind = 'poll' and public.is_server_member(c.server_id)
  )
);
DROP POLICY IF EXISTS poll_votes_insert_self ON public.poll_votes;
CREATE POLICY poll_votes_insert_self ON public.poll_votes FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() and exists (
    select 1 from public.channel_messages m
    join public.channels c on c.id = m.channel_id
    where m.id = message_id and m.kind = 'poll' and public.is_server_member(c.server_id)
  )
);
DROP POLICY IF EXISTS poll_votes_update_self ON public.poll_votes;
CREATE POLICY poll_votes_update_self ON public.poll_votes FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS poll_votes_delete_self ON public.poll_votes;
CREATE POLICY poll_votes_delete_self ON public.poll_votes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Amizades
DROP POLICY IF EXISTS friendships_read_participants ON public.friendships;
CREATE POLICY friendships_read_participants ON public.friendships FOR SELECT TO authenticated USING (auth.uid() in (requester_id, addressee_id));
DROP POLICY IF EXISTS friendships_delete_participants ON public.friendships;
CREATE POLICY friendships_delete_participants ON public.friendships FOR DELETE TO authenticated USING (auth.uid() in (requester_id, addressee_id));

-- DMs
DROP POLICY IF EXISTS direct_messages_read_participants ON public.direct_messages;
CREATE POLICY direct_messages_read_participants ON public.direct_messages FOR SELECT TO authenticated USING (auth.uid() in (sender_id, recipient_id));
DROP POLICY IF EXISTS direct_messages_insert_sender ON public.direct_messages;
CREATE POLICY direct_messages_insert_sender ON public.direct_messages FOR INSERT TO authenticated WITH CHECK (
  sender_id = auth.uid()
  and sender_id <> recipient_id
  and exists (
    select 1 from public.friendships f
    where f.status = 'accepted'
      and ((f.requester_id = sender_id and f.addressee_id = recipient_id)
        or (f.requester_id = recipient_id and f.addressee_id = sender_id))
  )
);
DROP POLICY IF EXISTS direct_messages_update_participants ON public.direct_messages;
DROP POLICY IF EXISTS direct_messages_update_sender ON public.direct_messages;
CREATE POLICY direct_messages_update_sender ON public.direct_messages FOR UPDATE TO authenticated USING (sender_id = auth.uid()) WITH CHECK (sender_id = auth.uid());
DROP POLICY IF EXISTS direct_messages_delete_sender ON public.direct_messages;
CREATE POLICY direct_messages_delete_sender ON public.direct_messages FOR DELETE TO authenticated USING (sender_id = auth.uid());

-- Eventos
DROP POLICY IF EXISTS server_events_read_members ON public.server_events;
CREATE POLICY server_events_read_members ON public.server_events FOR SELECT TO authenticated USING (public.is_server_member(server_id));
DROP POLICY IF EXISTS server_events_insert_members ON public.server_events;
CREATE POLICY server_events_insert_members ON public.server_events FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid() and public.is_server_member(server_id));
DROP POLICY IF EXISTS server_events_update_creator_or_manager ON public.server_events;
CREATE POLICY server_events_update_creator_or_manager ON public.server_events FOR UPDATE TO authenticated USING (created_by = auth.uid() or public.has_server_permission(server_id, 'MANAGE_SERVER')) WITH CHECK (created_by = auth.uid() or public.has_server_permission(server_id, 'MANAGE_SERVER'));
DROP POLICY IF EXISTS server_events_delete_creator_or_manager ON public.server_events;
CREATE POLICY server_events_delete_creator_or_manager ON public.server_events FOR DELETE TO authenticated USING (created_by = auth.uid() or public.has_server_permission(server_id, 'MANAGE_SERVER'));

DROP POLICY IF EXISTS event_rsvps_read_members ON public.event_rsvps;
CREATE POLICY event_rsvps_read_members ON public.event_rsvps FOR SELECT TO authenticated USING (
  exists (select 1 from public.server_events e where e.id = event_id and public.is_server_member(e.server_id))
);
DROP POLICY IF EXISTS event_rsvps_write_self ON public.event_rsvps;
CREATE POLICY event_rsvps_write_self ON public.event_rsvps FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() and exists (
    select 1 from public.server_events e where e.id = event_id and public.is_server_member(e.server_id)
  )
);
DROP POLICY IF EXISTS event_rsvps_update_self ON public.event_rsvps;
CREATE POLICY event_rsvps_update_self ON public.event_rsvps FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (
  user_id = auth.uid() and exists (
    select 1 from public.server_events e where e.id = event_id and public.is_server_member(e.server_id)
  )
);
DROP POLICY IF EXISTS event_rsvps_delete_self ON public.event_rsvps;
CREATE POLICY event_rsvps_delete_self ON public.event_rsvps FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Moderação
DROP POLICY IF EXISTS server_bans_read_managers ON public.server_bans;
CREATE POLICY server_bans_read_managers ON public.server_bans FOR SELECT TO authenticated USING (public.has_server_permission(server_id, 'KICK_MEMBERS'));
DROP POLICY IF EXISTS server_audit_read_managers ON public.server_audit_log;
CREATE POLICY server_audit_read_managers ON public.server_audit_log FOR SELECT TO authenticated USING (public.has_server_permission(server_id, 'MANAGE_SERVER') or public.has_server_permission(server_id, 'KICK_MEMBERS'));

-- ---------- RPCs seguras ----------

-- Corrige/garante criação de servidor via RPC.
drop function if exists public.create_tropa_server(text);
create function public.create_tropa_server(p_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_server_id uuid;
  v_name text := btrim(coalesce(p_name, ''));
begin
  if v_user_id is null then raise exception 'Você precisa estar autenticado.' using errcode = '42501'; end if;
  if char_length(v_name) < 2 or char_length(v_name) > 40 then raise exception 'Nome inválido.' using errcode = '22023'; end if;
  insert into public.servers(owner_id, name) values (v_user_id, v_name) returning id into v_server_id;
  return v_server_id;
end;
$$;
revoke all on function public.create_tropa_server(text) from public, anon;
grant execute on function public.create_tropa_server(text) to authenticated;

create or replace function public.send_friend_request(p_username text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_other uuid;
  v_existing uuid;
  v_id uuid;
begin
  if v_me is null then raise exception 'Autenticação necessária.' using errcode = '42501'; end if;
  select user_id into v_other from public.profiles where lower(username) = lower(btrim(p_username)) limit 1;
  if v_other is null then raise exception 'Usuário não encontrado.' using errcode = 'P0002'; end if;
  if v_other = v_me then raise exception 'Você não pode adicionar a si mesmo.' using errcode = '22023'; end if;
  select id into v_existing from public.friendships
    where (requester_id = v_me and addressee_id = v_other)
       or (requester_id = v_other and addressee_id = v_me)
    limit 1;
  if v_existing is not null then raise exception 'Já existe uma relação ou solicitação com este usuário.' using errcode = '23505'; end if;
  insert into public.friendships(requester_id, addressee_id, status)
  values (v_me, v_other, 'pending') returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.send_friend_request(text) from public, anon;
grant execute on function public.send_friend_request(text) to authenticated;

create or replace function public.respond_friend_request(p_request_id uuid, p_accept boolean)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_row public.friendships%rowtype;
begin
  if v_me is null then raise exception 'Autenticação necessária.' using errcode = '42501'; end if;
  select * into v_row from public.friendships where id = p_request_id for update;
  if not found or v_row.addressee_id <> v_me or v_row.status <> 'pending' then
    raise exception 'Solicitação inválida.' using errcode = '42501';
  end if;
  if p_accept then
    update public.friendships set status = 'accepted' where id = p_request_id;
  else
    delete from public.friendships where id = p_request_id;
  end if;
  return p_accept;
end;
$$;
revoke all on function public.respond_friend_request(uuid, boolean) from public, anon;
grant execute on function public.respond_friend_request(uuid, boolean) to authenticated;

create or replace function public.set_message_pin(p_message_id bigint, p_pin boolean)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_server uuid;
  v_user uuid := auth.uid();
begin
  select c.server_id into v_server
  from public.channel_messages m
  join public.channels c on c.id = m.channel_id
  where m.id = p_message_id;
  if v_server is null then raise exception 'Mensagem não encontrada.' using errcode = 'P0002'; end if;
  if not public.has_server_permission(v_server, 'MANAGE_MESSAGES', v_user)
     and not public.has_server_permission(v_server, 'ADMINISTRATOR', v_user) then
    raise exception 'Sem permissão para fixar mensagens.' using errcode = '42501';
  end if;
  update public.channel_messages
  set pinned = p_pin,
      pinned_by = case when p_pin then v_user else null end,
      pinned_at = case when p_pin then now() else null end
  where id = p_message_id;
  return p_pin;
end;
$$;
revoke all on function public.set_message_pin(bigint, boolean) from public, anon;
grant execute on function public.set_message_pin(bigint, boolean) to authenticated;

create or replace function public.ban_server_member(p_server_id uuid, p_user_id uuid, p_reason text default '')
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_owner uuid;
begin
  if v_me is null then raise exception 'Autenticação necessária.' using errcode = '42501'; end if;
  select owner_id into v_owner from public.servers where id = p_server_id;
  if v_owner is null then raise exception 'Servidor não encontrado.' using errcode = 'P0002'; end if;
  if p_user_id = v_owner then raise exception 'O proprietário não pode ser banido.' using errcode = '42501'; end if;
  if not public.has_server_permission(p_server_id, 'KICK_MEMBERS', v_me)
     and not public.has_server_permission(p_server_id, 'ADMINISTRATOR', v_me) then
    raise exception 'Sem permissão para banir.' using errcode = '42501';
  end if;
  insert into public.server_bans(server_id, user_id, banned_by, reason)
  values (p_server_id, p_user_id, v_me, left(coalesce(p_reason,''),300))
  on conflict (server_id, user_id) do update set banned_by = excluded.banned_by, reason = excluded.reason, created_at = now();
  delete from public.server_members where server_id = p_server_id and user_id = p_user_id;
  insert into public.server_audit_log(server_id, actor_id, action, target_user_id, metadata)
  values (p_server_id, v_me, 'MEMBER_BAN', p_user_id, jsonb_build_object('reason', left(coalesce(p_reason,''),300)));
  return true;
end;
$$;
revoke all on function public.ban_server_member(uuid, uuid, text) from public, anon;
grant execute on function public.ban_server_member(uuid, uuid, text) to authenticated;

create or replace function public.unban_server_member(p_server_id uuid, p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare v_me uuid := auth.uid(); begin
  if not public.has_server_permission(p_server_id, 'KICK_MEMBERS', v_me)
     and not public.has_server_permission(p_server_id, 'ADMINISTRATOR', v_me) then
    raise exception 'Sem permissão.' using errcode = '42501';
  end if;
  delete from public.server_bans where server_id = p_server_id and user_id = p_user_id;
  insert into public.server_audit_log(server_id, actor_id, action, target_user_id)
  values (p_server_id, v_me, 'MEMBER_UNBAN', p_user_id);
  return true;
end; $$;
revoke all on function public.unban_server_member(uuid, uuid) from public, anon;
grant execute on function public.unban_server_member(uuid, uuid) to authenticated;

-- Impede banido de aceitar convite.
create or replace function public.accept_invite(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.invites%rowtype;
  v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'Autenticação necessária.' using errcode='42501'; end if;
  select * into v_invite from public.invites where token = p_token for update;
  if not found then raise exception 'Convite inválido.' using errcode='P0002'; end if;
  if v_invite.expires_at is not null and v_invite.expires_at < now() then raise exception 'Convite expirado.' using errcode='22023'; end if;
  if v_invite.max_uses is not null and v_invite.uses >= v_invite.max_uses then raise exception 'Convite esgotado.' using errcode='22023'; end if;
  if exists(select 1 from public.server_bans b where b.server_id = v_invite.server_id and b.user_id = v_user) then
    raise exception 'Você foi banido deste servidor.' using errcode='42501';
  end if;
  if exists(select 1 from public.server_members sm where sm.server_id = v_invite.server_id and sm.user_id = v_user) then
    return v_invite.server_id;
  end if;
  insert into public.server_members(server_id, user_id)
  values(v_invite.server_id, v_user)
  on conflict do nothing;
  update public.invites set uses = uses + 1 where token = p_token;
  return v_invite.server_id;
end;
$$;
revoke all on function public.accept_invite(text) from public, anon;
grant execute on function public.accept_invite(text) to authenticated;

-- ---------- Storage ----------
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('profile-banners', 'profile-banners', true, 8388608, array['image/png','image/jpeg','image/webp','image/gif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets(id, name, public, file_size_limit)
values ('message-files', 'message-files', true, 26214400)
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

DROP POLICY IF EXISTS profile_banners_public_read ON storage.objects;
CREATE POLICY profile_banners_public_read ON storage.objects FOR SELECT TO public USING (bucket_id = 'profile-banners');
DROP POLICY IF EXISTS profile_banners_insert_own ON storage.objects;
CREATE POLICY profile_banners_insert_own ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='profile-banners' and (storage.foldername(name))[1]=auth.uid()::text);
DROP POLICY IF EXISTS profile_banners_update_own ON storage.objects;
CREATE POLICY profile_banners_update_own ON storage.objects FOR UPDATE TO authenticated USING (bucket_id='profile-banners' and (storage.foldername(name))[1]=auth.uid()::text) WITH CHECK (bucket_id='profile-banners' and (storage.foldername(name))[1]=auth.uid()::text);
DROP POLICY IF EXISTS profile_banners_delete_own ON storage.objects;
CREATE POLICY profile_banners_delete_own ON storage.objects FOR DELETE TO authenticated USING (bucket_id='profile-banners' and (storage.foldername(name))[1]=auth.uid()::text);

DROP POLICY IF EXISTS message_files_public_read ON storage.objects;
CREATE POLICY message_files_public_read ON storage.objects FOR SELECT TO public USING (bucket_id='message-files');
DROP POLICY IF EXISTS message_files_insert_own ON storage.objects;
CREATE POLICY message_files_insert_own ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='message-files' and (storage.foldername(name))[1]=auth.uid()::text);
DROP POLICY IF EXISTS message_files_delete_own ON storage.objects;
CREATE POLICY message_files_delete_own ON storage.objects FOR DELETE TO authenticated USING (bucket_id='message-files' and (storage.foldername(name))[1]=auth.uid()::text);

-- ---------- Realtime ----------
do $$ begin
  alter publication supabase_realtime add table public.message_reactions;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.poll_votes;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.friendships;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.direct_messages;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.server_events;
exception when duplicate_object then null; end $$;

commit;

notify pgrst, 'reload schema';

-- Verificação rápida
select 'Tropa V6 instalada' as status,
  to_regclass('public.friendships') is not null as friendships_ok,
  to_regclass('public.direct_messages') is not null as dm_ok,
  to_regclass('public.message_reactions') is not null as reactions_ok,
  to_regprocedure('public.create_tropa_server(text)') is not null as create_server_rpc_ok;
