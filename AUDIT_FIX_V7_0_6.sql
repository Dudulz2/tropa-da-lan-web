-- Tropa da Lan V7.0.6 - correções encontradas na auditoria
-- Execute APENAS se a V7 já estiver instalada. Pode ser executado mais de uma vez.

DO $$
BEGIN
  IF to_regclass('public.server_members') IS NULL THEN
    RAISE EXCEPTION 'Estrutura base ausente. Execute as migrações V4, V6 e V7 primeiro.';
  END IF;
  IF to_regprocedure('public.highest_role_position(uuid,uuid)') IS NULL THEN
    RAISE EXCEPTION 'Função highest_role_position ausente. Execute MIGRATION_V7_PRO.sql primeiro.';
  END IF;
END $$;

-- Hierarquia real para ações de moderação.
CREATE OR REPLACE FUNCTION public.can_moderate_member(
  p_server_id uuid,
  p_target_id uuid,
  p_actor_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path=public
AS $$
  SELECT
    p_actor_id IS NOT NULL
    AND p_target_id IS NOT NULL
    AND p_actor_id <> p_target_id
    AND public.is_server_member(p_server_id,p_target_id)
    AND NOT EXISTS(
      SELECT 1 FROM public.servers s
      WHERE s.id=p_server_id AND s.owner_id=p_target_id
    )
    AND (
      EXISTS(
        SELECT 1 FROM public.servers s
        WHERE s.id=p_server_id AND s.owner_id=p_actor_id
      )
      OR (
        public.has_server_permission(p_server_id,'KICK_MEMBERS',p_actor_id)
        AND public.highest_role_position(p_server_id,p_actor_id)
            > public.highest_role_position(p_server_id,p_target_id)
      )
    );
$$;

REVOKE ALL ON FUNCTION public.can_moderate_member(uuid,uuid,uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.can_moderate_member(uuid,uuid,uuid) TO authenticated;

-- Impede kick direto via tabela contra membro de cargo igual/superior.
DROP POLICY IF EXISTS members_delete_self_or_kick ON public.server_members;
CREATE POLICY members_delete_self_or_kick ON public.server_members
FOR DELETE TO authenticated
USING (
  NOT EXISTS(
    SELECT 1 FROM public.servers s
    WHERE s.id=server_id AND s.owner_id=user_id
  )
  AND (
    user_id=auth.uid()
    OR public.can_moderate_member(server_id,user_id,auth.uid())
  )
);

-- Restaura advertência com hierarquia (DB_REPAIR_V7 antigo podia sobrescrever por versão mais permissiva).
CREATE OR REPLACE FUNCTION public.warn_server_member(p_server_id uuid, p_user_id uuid, p_reason text DEFAULT '')
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public
AS $$
DECLARE v_id bigint;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Não autenticado'; END IF;
  IF NOT public.can_moderate_member(p_server_id,p_user_id,auth.uid()) THEN
    RAISE EXCEPTION 'Você não pode moderar este membro';
  END IF;
  INSERT INTO public.member_warnings(server_id,user_id,warned_by,reason)
  VALUES(p_server_id,p_user_id,auth.uid(),left(coalesce(p_reason,''),500))
  RETURNING id INTO v_id;
  INSERT INTO public.server_audit_log(server_id,actor_id,action,target_user_id,metadata)
  VALUES(p_server_id,auth.uid(),'warn_member',p_user_id,jsonb_build_object('reason',left(coalesce(p_reason,''),500)));
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.timeout_server_member(p_server_id uuid, p_user_id uuid, p_minutes integer, p_reason text DEFAULT '')
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public
AS $$
DECLARE v_until timestamptz;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Não autenticado'; END IF;
  IF NOT public.can_moderate_member(p_server_id,p_user_id,auth.uid()) THEN
    RAISE EXCEPTION 'Você não pode moderar este membro';
  END IF;
  IF p_minutes < 0 OR p_minutes > 40320 THEN RAISE EXCEPTION 'Duração inválida'; END IF;
  v_until := CASE WHEN p_minutes=0 THEN NULL ELSE now()+make_interval(mins=>p_minutes) END;
  UPDATE public.server_members SET timeout_until=v_until WHERE server_id=p_server_id AND user_id=p_user_id;
  INSERT INTO public.server_audit_log(server_id,actor_id,action,target_user_id,metadata)
  VALUES(
    p_server_id,auth.uid(),
    CASE WHEN v_until IS NULL THEN 'remove_timeout' ELSE 'timeout_member' END,
    p_user_id,
    jsonb_build_object('minutes',p_minutes,'reason',left(coalesce(p_reason,''),500),'until',v_until)
  );
  RETURN v_until;
END;
$$;

-- Banimento também respeita a hierarquia.
CREATE OR REPLACE FUNCTION public.ban_server_member(p_server_id uuid, p_user_id uuid, p_reason text DEFAULT '')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public
AS $$
DECLARE v_me uuid := auth.uid();
BEGIN
  IF v_me IS NULL THEN RAISE EXCEPTION 'Autenticação necessária.' USING errcode='42501'; END IF;
  IF NOT public.can_moderate_member(p_server_id,p_user_id,v_me) THEN
    RAISE EXCEPTION 'Você não pode banir este membro.' USING errcode='42501';
  END IF;
  INSERT INTO public.server_bans(server_id,user_id,banned_by,reason)
  VALUES(p_server_id,p_user_id,v_me,left(coalesce(p_reason,''),300))
  ON CONFLICT(server_id,user_id) DO UPDATE
    SET banned_by=excluded.banned_by, reason=excluded.reason, created_at=now();
  DELETE FROM public.server_members WHERE server_id=p_server_id AND user_id=p_user_id;
  INSERT INTO public.server_audit_log(server_id,actor_id,action,target_user_id,metadata)
  VALUES(p_server_id,v_me,'MEMBER_BAN',p_user_id,jsonb_build_object('reason',left(coalesce(p_reason,''),300)));
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.warn_server_member(uuid,uuid,text) FROM public;
REVOKE ALL ON FUNCTION public.timeout_server_member(uuid,uuid,integer,text) FROM public;
REVOKE ALL ON FUNCTION public.ban_server_member(uuid,uuid,text) FROM public;
GRANT EXECUTE ON FUNCTION public.warn_server_member(uuid,uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.timeout_server_member(uuid,uuid,integer,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ban_server_member(uuid,uuid,text) TO authenticated;

NOTIFY pgrst, 'reload schema';

SELECT
  'Tropa V7.0.6 audit fix instalado' AS status,
  to_regprocedure('public.can_moderate_member(uuid,uuid,uuid)') IS NOT NULL AS hierarchy_ok,
  to_regprocedure('public.warn_server_member(uuid,uuid,text)') IS NOT NULL AS warn_ok,
  to_regprocedure('public.timeout_server_member(uuid,uuid,integer,text)') IS NOT NULL AS timeout_ok,
  to_regprocedure('public.ban_server_member(uuid,uuid,text)') IS NOT NULL AS ban_ok;
