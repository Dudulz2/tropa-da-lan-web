-- Tropa da Lan V4.2.2
-- Correção da criação de servidor com RLS.
-- Execute este arquivo UMA VEZ no Supabase > SQL Editor.

create or replace function public.create_tropa_server(p_name text)
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
  if v_user_id is null then
    raise exception 'Você precisa estar autenticado para criar um servidor.';
  end if;

  if char_length(v_name) < 2 or char_length(v_name) > 40 then
    raise exception 'O nome do servidor deve ter entre 2 e 40 caracteres.';
  end if;

  insert into public.servers(owner_id, name)
  values (v_user_id, v_name)
  returning id into v_server_id;

  return v_server_id;
end;
$$;

revoke all on function public.create_tropa_server(text) from public;
revoke all on function public.create_tropa_server(text) from anon;
grant execute on function public.create_tropa_server(text) to authenticated;

-- Mantém a política normal para outras operações e para consistência.
alter table public.servers enable row level security;
drop policy if exists servers_create_self on public.servers;
create policy servers_create_self on public.servers
for insert to authenticated
with check ((select auth.uid()) = owner_id);
