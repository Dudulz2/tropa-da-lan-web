-- ============================================================================
-- TROPA DA LAN WEB V4 — MIGRAÇÃO COMPLETA
-- Execute no Supabase > SQL Editor UMA VEZ.
--
-- IMPORTANTE (Authentication > Providers > Email):
--   1) Mantenha Email/Password habilitado.
--   2) Para o login somente com USUÁRIO + SENHA desta versão, DESATIVE
--      "Confirm email". O app usa um e-mail técnico não entregável derivado
--      do nome de usuário apenas para aproveitar o Supabase Auth com segurança.
--
-- Este script não apaga a tabela antiga public.messages. Ele apenas remove as
-- políticas públicas antigas dela e passa a usar channel_messages na V4.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------- Helpers ----------
create or replace function public.try_uuid(value text)
returns uuid
language plpgsql
immutable
as $$
begin
  return value::uuid;
exception when others then
  return null;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- Perfis ----------
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  display_name text not null,
  bio text not null default '',
  custom_status text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_len check (char_length(username) between 3 and 20),
  constraint profiles_username_chars check (username ~ '^[a-z0-9][a-z0-9._-]{1,18}[a-z0-9]$' and position('..' in username) = 0),
  constraint profiles_display_name_len check (char_length(display_name) between 1 and 32),
  constraint profiles_bio_len check (char_length(bio) <= 190),
  constraint profiles_status_len check (char_length(custom_status) <= 64)
);
create unique index if not exists profiles_username_lower_uidx on public.profiles (lower(username));

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.protect_profile_username()
returns trigger
language plpgsql
as $$
begin
  if new.username <> old.username then
    raise exception 'O nome de usuário usado para login não pode ser alterado. Altere apenas o nome de exibição.';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_username_trigger on public.profiles;
create trigger protect_profile_username_trigger
before update on public.profiles
for each row execute function public.protect_profile_username();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_username text;
begin
  requested_username := lower(coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)));
  if requested_username !~ '^[a-z0-9][a-z0-9._-]{1,18}[a-z0-9]$' or position('..' in requested_username) > 0 then
    raise exception 'Nome de usuário inválido';
  end if;

  insert into public.profiles (user_id, username, display_name)
  values (new.id, requested_username, coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), requested_username))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------- Servidores / membros ----------
create table if not exists public.servers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(user_id) on delete restrict,
  name text not null,
  description text not null default '',
  icon_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint servers_name_len check (char_length(name) between 2 and 40),
  constraint servers_description_len check (char_length(description) <= 180)
);

drop trigger if exists servers_set_updated_at on public.servers;
create trigger servers_set_updated_at
before update on public.servers
for each row execute function public.set_updated_at();

create table if not exists public.server_members (
  server_id uuid not null references public.servers(id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  nickname text,
  joined_at timestamptz not null default now(),
  primary key (server_id, user_id),
  constraint member_nickname_len check (nickname is null or char_length(nickname) between 1 and 32)
);
create index if not exists server_members_user_idx on public.server_members(user_id, joined_at);

-- ---------- Cargos ----------
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  server_id uuid not null references public.servers(id) on delete cascade,
  name text not null,
  color text not null default '#99A1B3',
  position integer not null default 0,
  permissions text[] not null default '{}',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  constraint roles_name_len check (char_length(name) between 1 and 32),
  constraint roles_color_hex check (color ~ '^#[0-9A-Fa-f]{6}$'),
  unique (id, server_id)
);
create index if not exists roles_server_position_idx on public.roles(server_id, position desc);
create unique index if not exists roles_one_default_per_server_idx on public.roles(server_id) where is_default;

create table if not exists public.member_roles (
  server_id uuid not null,
  user_id uuid not null,
  role_id uuid not null,
  assigned_at timestamptz not null default now(),
  primary key (server_id, user_id, role_id),
  foreign key (server_id, user_id) references public.server_members(server_id, user_id) on delete cascade,
  foreign key (role_id, server_id) references public.roles(id, server_id) on delete cascade
);

-- ---------- Canais ----------
create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  server_id uuid not null references public.servers(id) on delete cascade,
  name text not null,
  type text not null default 'text' check (type in ('text','voice')),
  topic text not null default '',
  position integer not null default 0,
  created_by uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  constraint channels_name_len check (char_length(name) between 1 and 32),
  constraint channels_topic_len check (char_length(topic) <= 180)
);
create unique index if not exists channels_unique_name_type_idx on public.channels(server_id, type, lower(name));
create index if not exists channels_server_position_idx on public.channels(server_id, type, position, created_at);

-- ---------- Mensagens ----------
create table if not exists public.channel_messages (
  id bigint generated by default as identity primary key,
  channel_id uuid not null references public.channels(id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  content text not null,
  reply_to bigint references public.channel_messages(id) on delete set null,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  constraint channel_messages_content_len check (char_length(content) between 1 and 2000)
);
create index if not exists channel_messages_channel_created_idx on public.channel_messages(channel_id, created_at desc);

-- ---------- Convites ----------
create table if not exists public.invites (
  token text primary key,
  server_id uuid not null references public.servers(id) on delete cascade,
  created_by uuid not null references public.profiles(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  max_uses integer,
  uses integer not null default 0,
  constraint invites_max_uses_positive check (max_uses is null or max_uses > 0),
  constraint invites_uses_nonnegative check (uses >= 0)
);
create index if not exists invites_server_idx on public.invites(server_id, created_at desc);

-- ---------- Funções de permissão ----------
create or replace function public.is_server_member(p_server_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.server_members sm
    where sm.server_id = p_server_id and sm.user_id = p_user_id
  );
$$;

create or replace function public.has_server_permission(p_server_id uuid, p_permission text, p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    exists(select 1 from public.servers s where s.id = p_server_id and s.owner_id = p_user_id)
    or exists (
      select 1
      from public.roles r
      where r.server_id = p_server_id
        and r.is_default = true
        and (p_permission = any(r.permissions) or 'ADMINISTRATOR' = any(r.permissions))
        and public.is_server_member(p_server_id, p_user_id)
    )
    or exists (
      select 1
      from public.member_roles mr
      join public.roles r on r.id = mr.role_id and r.server_id = mr.server_id
      where mr.server_id = p_server_id
        and mr.user_id = p_user_id
        and (p_permission = any(r.permissions) or 'ADMINISTRATOR' = any(r.permissions))
    );
$$;

revoke all on function public.is_server_member(uuid, uuid) from public;
revoke all on function public.has_server_permission(uuid, text, uuid) from public;
grant execute on function public.is_server_member(uuid, uuid) to authenticated;
grant execute on function public.has_server_permission(uuid, text, uuid) to authenticated;

-- ---------- Proteções estruturais ----------
create or replace function public.bootstrap_server()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.server_members(server_id, user_id) values (new.id, new.owner_id)
  on conflict do nothing;

  insert into public.roles(server_id, name, color, position, permissions, is_default)
  values (
    new.id,
    '@everyone',
    '#99A1B3',
    0,
    array['VIEW_CHANNEL','SEND_MESSAGES','CONNECT','SPEAK','CREATE_INSTANT_INVITE'],
    true
  ) on conflict do nothing;

  insert into public.channels(server_id, name, type, topic, position, created_by)
  values
    (new.id, 'geral', 'text', 'Conversa geral do servidor', 0, new.owner_id),
    (new.id, 'Geral', 'voice', '', 0, new.owner_id)
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists server_bootstrap_trigger on public.servers;
create trigger server_bootstrap_trigger
after insert on public.servers
for each row execute function public.bootstrap_server();

create or replace function public.protect_server_owner()
returns trigger
language plpgsql
as $$
begin
  if new.owner_id <> old.owner_id then
    raise exception 'A transferência de propriedade não está habilitada nesta versão.';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_server_owner_trigger on public.servers;
create trigger protect_server_owner_trigger
before update on public.servers
for each row execute function public.protect_server_owner();

create or replace function public.protect_default_role()
returns trigger
language plpgsql
as $$
begin
  if old.is_default then
    if new.is_default is distinct from true or new.server_id <> old.server_id or new.name <> '@everyone' then
      raise exception 'O cargo @everyone não pode ser renomeado ou movido.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_default_role_trigger on public.roles;
create trigger protect_default_role_trigger
before update on public.roles
for each row execute function public.protect_default_role();

-- ---------- Convites: RPC segura ----------
create or replace function public.create_server_invite(
  p_server_id uuid,
  p_expires_hours integer default 168,
  p_max_uses integer default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token text;
begin
  if auth.uid() is null then raise exception 'Não autenticado'; end if;
  if not public.has_server_permission(p_server_id, 'CREATE_INSTANT_INVITE', auth.uid()) then
    raise exception 'Sem permissão para criar convites';
  end if;
  if p_expires_hours is not null and (p_expires_hours < 1 or p_expires_hours > 8760) then
    raise exception 'Validade inválida';
  end if;
  if p_max_uses is not null and (p_max_uses < 1 or p_max_uses > 10000) then
    raise exception 'Limite de usos inválido';
  end if;

  loop
    v_token := substr(replace(gen_random_uuid()::text, '-', ''), 1, 18);
    begin
      insert into public.invites(token, server_id, created_by, expires_at, max_uses)
      values (
        v_token,
        p_server_id,
        auth.uid(),
        case when p_expires_hours is null then null else now() + make_interval(hours => p_expires_hours) end,
        p_max_uses
      );
      exit;
    exception when unique_violation then
      -- gera outro token
    end;
  end loop;
  return v_token;
end;
$$;

create or replace function public.get_invite(p_token text)
returns table(server_id uuid, server_name text, server_icon_url text, member_count bigint, valid boolean)
language sql
stable
security definer
set search_path = public
as $$
  select
    s.id,
    s.name,
    s.icon_url,
    (select count(*) from public.server_members sm where sm.server_id = s.id),
    (i.expires_at is null or i.expires_at > now()) and (i.max_uses is null or i.uses < i.max_uses)
  from public.invites i
  join public.servers s on s.id = i.server_id
  where i.token = lower(trim(p_token))
  limit 1;
$$;

create or replace function public.accept_invite(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.invites%rowtype;
  v_rows integer := 0;
begin
  if auth.uid() is null then raise exception 'Não autenticado'; end if;

  select * into v_invite
  from public.invites
  where token = lower(trim(p_token))
  for update;

  if not found then raise exception 'Convite inválido'; end if;
  if v_invite.expires_at is not null and v_invite.expires_at <= now() then raise exception 'Convite expirado'; end if;
  if v_invite.max_uses is not null and v_invite.uses >= v_invite.max_uses then raise exception 'Convite esgotado'; end if;

  insert into public.server_members(server_id, user_id)
  values (v_invite.server_id, auth.uid())
  on conflict do nothing;
  get diagnostics v_rows = row_count;

  if v_rows > 0 then
    update public.invites set uses = uses + 1 where token = v_invite.token;
  end if;

  return v_invite.server_id;
end;
$$;

grant execute on function public.create_server_invite(uuid, integer, integer) to authenticated;
grant execute on function public.get_invite(text) to anon, authenticated;
grant execute on function public.accept_invite(text) to authenticated;

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.servers enable row level security;
alter table public.server_members enable row level security;
alter table public.roles enable row level security;
alter table public.member_roles enable row level security;
alter table public.channels enable row level security;
alter table public.channel_messages enable row level security;
alter table public.invites enable row level security;

-- perfis
drop policy if exists profiles_read_authenticated on public.profiles;
create policy profiles_read_authenticated on public.profiles
for select to authenticated using (true);
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- servidores
drop policy if exists servers_read_members on public.servers;
create policy servers_read_members on public.servers
for select to authenticated using (public.is_server_member(id, auth.uid()));
drop policy if exists servers_create_self on public.servers;
create policy servers_create_self on public.servers
for insert to authenticated with check (owner_id = auth.uid());
drop policy if exists servers_update_managers on public.servers;
create policy servers_update_managers on public.servers
for update to authenticated
using (public.has_server_permission(id, 'MANAGE_SERVER', auth.uid()))
with check (public.has_server_permission(id, 'MANAGE_SERVER', auth.uid()));
drop policy if exists servers_delete_owner on public.servers;
create policy servers_delete_owner on public.servers
for delete to authenticated using (owner_id = auth.uid());

-- membros
drop policy if exists members_read_same_server on public.server_members;
create policy members_read_same_server on public.server_members
for select to authenticated using (public.is_server_member(server_id, auth.uid()));
drop policy if exists members_update_self_or_manager on public.server_members;
create policy members_update_self_or_manager on public.server_members
for update to authenticated
using (user_id = auth.uid() or public.has_server_permission(server_id, 'MANAGE_NICKNAMES', auth.uid()))
with check (user_id = auth.uid() or public.has_server_permission(server_id, 'MANAGE_NICKNAMES', auth.uid()));
drop policy if exists members_delete_self_or_kick on public.server_members;
create policy members_delete_self_or_kick on public.server_members
for delete to authenticated
using (
  not exists (select 1 from public.servers s where s.id = server_id and s.owner_id = user_id)
  and (user_id = auth.uid() or public.has_server_permission(server_id, 'KICK_MEMBERS', auth.uid()))
);

-- cargos
drop policy if exists roles_read_members on public.roles;
create policy roles_read_members on public.roles
for select to authenticated using (public.is_server_member(server_id, auth.uid()));
drop policy if exists roles_insert_managers on public.roles;
create policy roles_insert_managers on public.roles
for insert to authenticated with check (public.has_server_permission(server_id, 'MANAGE_ROLES', auth.uid()));
drop policy if exists roles_update_managers on public.roles;
create policy roles_update_managers on public.roles
for update to authenticated
using (public.has_server_permission(server_id, 'MANAGE_ROLES', auth.uid()))
with check (public.has_server_permission(server_id, 'MANAGE_ROLES', auth.uid()));
drop policy if exists roles_delete_managers on public.roles;
create policy roles_delete_managers on public.roles
for delete to authenticated using (
  not is_default and public.has_server_permission(server_id, 'MANAGE_ROLES', auth.uid())
);

-- atribuição de cargos
drop policy if exists member_roles_read_members on public.member_roles;
create policy member_roles_read_members on public.member_roles
for select to authenticated using (public.is_server_member(server_id, auth.uid()));
drop policy if exists member_roles_insert_managers on public.member_roles;
create policy member_roles_insert_managers on public.member_roles
for insert to authenticated with check (public.has_server_permission(server_id, 'MANAGE_ROLES', auth.uid()));
drop policy if exists member_roles_delete_managers on public.member_roles;
create policy member_roles_delete_managers on public.member_roles
for delete to authenticated using (public.has_server_permission(server_id, 'MANAGE_ROLES', auth.uid()));

-- canais
drop policy if exists channels_read_members on public.channels;
create policy channels_read_members on public.channels
for select to authenticated using (
  public.is_server_member(server_id, auth.uid())
  and public.has_server_permission(server_id, 'VIEW_CHANNEL', auth.uid())
);
drop policy if exists channels_insert_managers on public.channels;
create policy channels_insert_managers on public.channels
for insert to authenticated with check (
  public.has_server_permission(server_id, 'MANAGE_CHANNELS', auth.uid())
  and created_by = auth.uid()
);
drop policy if exists channels_update_managers on public.channels;
create policy channels_update_managers on public.channels
for update to authenticated
using (public.has_server_permission(server_id, 'MANAGE_CHANNELS', auth.uid()))
with check (public.has_server_permission(server_id, 'MANAGE_CHANNELS', auth.uid()));
drop policy if exists channels_delete_managers on public.channels;
create policy channels_delete_managers on public.channels
for delete to authenticated using (public.has_server_permission(server_id, 'MANAGE_CHANNELS', auth.uid()));

-- mensagens
drop policy if exists channel_messages_read_members on public.channel_messages;
create policy channel_messages_read_members on public.channel_messages
for select to authenticated using (
  exists (
    select 1 from public.channels c
    where c.id = channel_id and public.is_server_member(c.server_id, auth.uid())
  )
);
drop policy if exists channel_messages_insert_members on public.channel_messages;
create policy channel_messages_insert_members on public.channel_messages
for insert to authenticated with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.channels c
    where c.id = channel_id
      and c.type = 'text'
      and public.has_server_permission(c.server_id, 'SEND_MESSAGES', auth.uid())
  )
);
drop policy if exists channel_messages_update_own on public.channel_messages;
create policy channel_messages_update_own on public.channel_messages
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists channel_messages_delete_own_or_manage on public.channel_messages;
create policy channel_messages_delete_own_or_manage on public.channel_messages
for delete to authenticated using (
  user_id = auth.uid()
  or exists (
    select 1 from public.channels c
    where c.id = channel_id and public.has_server_permission(c.server_id, 'MANAGE_MESSAGES', auth.uid())
  )
);

-- convites
drop policy if exists invites_read_managers on public.invites;
create policy invites_read_managers on public.invites
for select to authenticated using (
  created_by = auth.uid() or public.has_server_permission(server_id, 'MANAGE_SERVER', auth.uid())
);
drop policy if exists invites_delete_managers on public.invites;
create policy invites_delete_managers on public.invites
for delete to authenticated using (
  created_by = auth.uid() or public.has_server_permission(server_id, 'MANAGE_SERVER', auth.uid())
);

-- ---------- Desativa o chat público antigo da V3 ----------
do $$
begin
  if to_regclass('public.messages') is not null then
    execute 'alter table public.messages enable row level security';
    execute 'drop policy if exists "Tropa public read messages" on public.messages';
    execute 'drop policy if exists "Tropa public insert messages" on public.messages';
  end if;
end $$;

-- ---------- Storage ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif']),
  ('server-icons', 'server-icons', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- avatar: cada usuário só escreve dentro da própria pasta UUID/
drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read on storage.objects
for select to public using (bucket_id = 'avatars');
drop policy if exists avatars_insert_own on storage.objects;
create policy avatars_insert_own on storage.objects
for insert to authenticated with check (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
);
drop policy if exists avatars_update_own on storage.objects;
create policy avatars_update_own on storage.objects
for update to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists avatars_delete_own on storage.objects;
create policy avatars_delete_own on storage.objects
for delete to authenticated using (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
);

-- ícone de servidor: somente quem pode gerenciar o servidor da pasta UUID/
drop policy if exists server_icons_public_read on storage.objects;
create policy server_icons_public_read on storage.objects
for select to public using (bucket_id = 'server-icons');
drop policy if exists server_icons_insert_manager on storage.objects;
create policy server_icons_insert_manager on storage.objects
for insert to authenticated with check (
  bucket_id = 'server-icons'
  and public.has_server_permission(public.try_uuid((storage.foldername(name))[1]), 'MANAGE_SERVER', auth.uid())
);
drop policy if exists server_icons_update_manager on storage.objects;
create policy server_icons_update_manager on storage.objects
for update to authenticated
using (
  bucket_id = 'server-icons'
  and public.has_server_permission(public.try_uuid((storage.foldername(name))[1]), 'MANAGE_SERVER', auth.uid())
)
with check (
  bucket_id = 'server-icons'
  and public.has_server_permission(public.try_uuid((storage.foldername(name))[1]), 'MANAGE_SERVER', auth.uid())
);
drop policy if exists server_icons_delete_manager on storage.objects;
create policy server_icons_delete_manager on storage.objects
for delete to authenticated using (
  bucket_id = 'server-icons'
  and public.has_server_permission(public.try_uuid((storage.foldername(name))[1]), 'MANAGE_SERVER', auth.uid())
);

-- Mantém colunas suficientes nos eventos UPDATE/DELETE do Realtime.
alter table public.channel_messages replica identity full;
alter table public.channels replica identity full;
alter table public.server_members replica identity full;
alter table public.roles replica identity full;
alter table public.member_roles replica identity full;

-- ---------- Realtime para tabelas usadas pela interface ----------
do $$
declare
  t text;
begin
  foreach t in array array['channel_messages','channels','server_members','roles','member_roles']
  loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;

-- Reforça privilégios de execução das RPCs públicas/seguras.
revoke all on function public.create_server_invite(uuid, integer, integer) from public;
revoke all on function public.accept_invite(text) from public;
grant execute on function public.create_server_invite(uuid, integer, integer) to authenticated;
grant execute on function public.get_invite(text) to anon, authenticated;
grant execute on function public.accept_invite(text) to authenticated;

-- FIM V4
