-- TROPA DA LAN V6.0.2 — correção gen_random_bytes
-- Pode executar este arquivo sozinho no Supabase > SQL Editor.

create or replace function public.create_server_invite(
  p_server_id uuid,
  p_expires_hours integer default 168,
  p_max_uses integer default null
)
returns text
language plpgsql
security definer
set search_path = ''
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
      null;
    end;
  end loop;
  return v_token;
end;
$$;

revoke all on function public.create_server_invite(uuid, integer, integer) from public, anon;
grant execute on function public.create_server_invite(uuid, integer, integer) to authenticated;

notify pgrst, 'reload schema';

select
  to_regprocedure('public.create_server_invite(uuid,integer,integer)') is not null as create_invite_rpc_ok;
