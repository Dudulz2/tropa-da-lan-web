-- Tropa da Lan V7.0.4 - reparo de banco
-- Execute no Supabase SQL Editor. Pode ser executado mais de uma vez.
-- Requer a estrutura V6 instalada.

-- 1) Verificação da base V6
DO $$
BEGIN
  IF to_regclass('public.user_preferences') IS NULL THEN RAISE EXCEPTION 'Falta public.user_preferences. Execute MIGRATION_V6_ULTIMATE.sql primeiro.'; END IF;
  IF to_regclass('public.servers') IS NULL THEN RAISE EXCEPTION 'Falta public.servers. Execute supabase_v4.sql primeiro.'; END IF;
  IF to_regclass('public.channels') IS NULL THEN RAISE EXCEPTION 'Falta public.channels. Execute supabase_v4.sql primeiro.'; END IF;
  IF to_regclass('public.server_members') IS NULL THEN RAISE EXCEPTION 'Falta public.server_members. Execute supabase_v4.sql primeiro.'; END IF;
  IF to_regclass('public.poll_votes') IS NULL THEN RAISE EXCEPTION 'Falta public.poll_votes. Execute MIGRATION_V6_ULTIMATE.sql primeiro.'; END IF;
END $$;

-- 2) Colunas V7 usadas já na inicialização
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS audio_output_id text;
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS push_to_talk boolean NOT NULL DEFAULT false;
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS push_to_talk_key text NOT NULL DEFAULT 'Space';
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS voice_sensitivity integer NOT NULL DEFAULT 45;
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS screen_quality text NOT NULL DEFAULT '1080p';
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS screen_fps integer NOT NULL DEFAULT 30;
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS stream_mode text NOT NULL DEFAULT 'balanced';
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS low_bandwidth boolean NOT NULL DEFAULT false;
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS notification_level text NOT NULL DEFAULT 'mentions';

ALTER TABLE public.servers ADD COLUMN IF NOT EXISTS banner_url text;
ALTER TABLE public.servers ADD COLUMN IF NOT EXISTS accent_color text NOT NULL DEFAULT '#1D8DFF';
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Geral';
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS is_private boolean NOT NULL DEFAULT false;
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS allowed_role_ids uuid[] NOT NULL DEFAULT '{}';
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS read_only boolean NOT NULL DEFAULT false;
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS slowmode_seconds integer NOT NULL DEFAULT 0;
ALTER TABLE public.server_members ADD COLUMN IF NOT EXISTS timeout_until timestamptz;

-- 3) Ajustes de valores antes das constraints
UPDATE public.user_preferences SET voice_sensitivity = 45 WHERE voice_sensitivity IS NULL OR voice_sensitivity NOT BETWEEN 5 AND 95;
UPDATE public.user_preferences SET screen_quality = '1080p' WHERE screen_quality IS NULL OR screen_quality NOT IN ('720p','1080p','1440p');
UPDATE public.user_preferences SET screen_fps = 30 WHERE screen_fps IS NULL OR screen_fps NOT IN (15,30,60);
UPDATE public.user_preferences SET stream_mode = 'balanced' WHERE stream_mode IS NULL OR stream_mode NOT IN ('quality','balanced','fluidity');
UPDATE public.user_preferences SET notification_level = 'mentions' WHERE notification_level IS NULL OR notification_level NOT IN ('all','mentions','none');
UPDATE public.servers SET accent_color = '#1D8DFF' WHERE accent_color IS NULL OR accent_color !~ '^#[0-9A-Fa-f]{6}$';
UPDATE public.channels SET category = 'Geral' WHERE category IS NULL OR btrim(category) = '';
UPDATE public.channels SET slowmode_seconds = 0 WHERE slowmode_seconds IS NULL OR slowmode_seconds < 0 OR slowmode_seconds > 21600;

-- 4) Constraints idempotentes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='user_preferences_voice_sensitivity_check' AND conrelid='public.user_preferences'::regclass) THEN
    ALTER TABLE public.user_preferences ADD CONSTRAINT user_preferences_voice_sensitivity_check CHECK (voice_sensitivity BETWEEN 5 AND 95);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='user_preferences_screen_quality_check' AND conrelid='public.user_preferences'::regclass) THEN
    ALTER TABLE public.user_preferences ADD CONSTRAINT user_preferences_screen_quality_check CHECK (screen_quality IN ('720p','1080p','1440p'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='user_preferences_screen_fps_check' AND conrelid='public.user_preferences'::regclass) THEN
    ALTER TABLE public.user_preferences ADD CONSTRAINT user_preferences_screen_fps_check CHECK (screen_fps IN (15,30,60));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='user_preferences_stream_mode_check' AND conrelid='public.user_preferences'::regclass) THEN
    ALTER TABLE public.user_preferences ADD CONSTRAINT user_preferences_stream_mode_check CHECK (stream_mode IN ('quality','balanced','fluidity'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='user_preferences_notification_level_check' AND conrelid='public.user_preferences'::regclass) THEN
    ALTER TABLE public.user_preferences ADD CONSTRAINT user_preferences_notification_level_check CHECK (notification_level IN ('all','mentions','none'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='servers_accent_color_hex_v7' AND conrelid='public.servers'::regclass) THEN
    ALTER TABLE public.servers ADD CONSTRAINT servers_accent_color_hex_v7 CHECK (accent_color ~ '^#[0-9A-Fa-f]{6}$');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='channels_category_len_v7' AND conrelid='public.channels'::regclass) THEN
    ALTER TABLE public.channels ADD CONSTRAINT channels_category_len_v7 CHECK (char_length(category) BETWEEN 1 AND 32);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='channels_slowmode_v7' AND conrelid='public.channels'::regclass) THEN
    ALTER TABLE public.channels ADD CONSTRAINT channels_slowmode_v7 CHECK (slowmode_seconds BETWEEN 0 AND 21600);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS channels_server_category_position_v7_idx ON public.channels(server_id, category, position, created_at);
CREATE INDEX IF NOT EXISTS server_members_timeout_v7_idx ON public.server_members(server_id, timeout_until) WHERE timeout_until IS NOT NULL;

-- 5) Corrige PK de votos de enquete para permitir múltipla escolha
DO $$
DECLARE pk_name text;
BEGIN
  SELECT conname INTO pk_name FROM pg_constraint WHERE conrelid='public.poll_votes'::regclass AND contype='p' LIMIT 1;
  IF pk_name IS NOT NULL THEN EXECUTE format('ALTER TABLE public.poll_votes DROP CONSTRAINT %I', pk_name); END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='public.poll_votes'::regclass AND contype='p'
  ) THEN
    ALTER TABLE public.poll_votes ADD CONSTRAINT poll_votes_pkey PRIMARY KEY(message_id,user_id,option_index);
  END IF;
END $$;

-- 6) Tabelas V7
CREATE TABLE IF NOT EXISTS public.server_notification_settings (
  server_id uuid NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  level text NOT NULL DEFAULT 'mentions' CHECK (level IN ('all','mentions','none')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(server_id,user_id)
);
ALTER TABLE public.server_notification_settings ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.member_warnings (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  server_id uuid NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  warned_by uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  reason text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS member_warnings_server_user_v7_idx ON public.member_warnings(server_id,user_id,created_at DESC);
ALTER TABLE public.member_warnings ENABLE ROW LEVEL SECURITY;

-- 7) Funções V7
CREATE OR REPLACE FUNCTION public.highest_role_position(p_server_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT CASE WHEN EXISTS(SELECT 1 FROM public.servers s WHERE s.id=p_server_id AND s.owner_id=p_user_id) THEN 2147483647
  ELSE coalesce((SELECT max(r.position) FROM public.roles r WHERE r.server_id=p_server_id AND (r.is_default=true OR EXISTS(SELECT 1 FROM public.member_roles mr WHERE mr.server_id=p_server_id AND mr.user_id=p_user_id AND mr.role_id=r.id))),-1) END;
$$;

CREATE OR REPLACE FUNCTION public.can_manage_role(p_role_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS(SELECT 1 FROM public.roles r WHERE r.id=p_role_id AND r.is_default=false AND public.has_server_permission(r.server_id,'MANAGE_ROLES',p_user_id) AND public.highest_role_position(r.server_id,p_user_id)>r.position);
$$;

CREATE OR REPLACE FUNCTION public.can_view_channel(p_channel_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.channels c
    WHERE c.id=p_channel_id
      AND public.is_server_member(c.server_id,p_user_id)
      AND public.has_server_permission(c.server_id,'VIEW_CHANNEL',p_user_id)
      AND (
        c.is_private=false
        OR EXISTS(SELECT 1 FROM public.servers s WHERE s.id=c.server_id AND s.owner_id=p_user_id)
        OR public.has_server_permission(c.server_id,'MANAGE_CHANNELS',p_user_id)
        OR EXISTS(SELECT 1 FROM public.member_roles mr WHERE mr.server_id=c.server_id AND mr.user_id=p_user_id AND mr.role_id=ANY(c.allowed_role_ids))
      )
  );
$$;

REVOKE ALL ON FUNCTION public.highest_role_position(uuid,uuid) FROM public;
REVOKE ALL ON FUNCTION public.can_manage_role(uuid,uuid) FROM public;
REVOKE ALL ON FUNCTION public.can_view_channel(uuid,uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.highest_role_position(uuid,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_role(uuid,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_view_channel(uuid,uuid) TO authenticated;

-- 8) Políticas mínimas necessárias
DROP POLICY IF EXISTS server_notifications_self_select ON public.server_notification_settings;
CREATE POLICY server_notifications_self_select ON public.server_notification_settings FOR SELECT TO authenticated USING (user_id=auth.uid() AND public.is_server_member(server_id,auth.uid()));
DROP POLICY IF EXISTS server_notifications_self_insert ON public.server_notification_settings;
CREATE POLICY server_notifications_self_insert ON public.server_notification_settings FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid() AND public.is_server_member(server_id,auth.uid()));
DROP POLICY IF EXISTS server_notifications_self_update ON public.server_notification_settings;
CREATE POLICY server_notifications_self_update ON public.server_notification_settings FOR UPDATE TO authenticated USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());
DROP POLICY IF EXISTS server_notifications_self_delete ON public.server_notification_settings;
CREATE POLICY server_notifications_self_delete ON public.server_notification_settings FOR DELETE TO authenticated USING (user_id=auth.uid());

DROP POLICY IF EXISTS channels_read_members ON public.channels;
CREATE POLICY channels_read_members ON public.channels FOR SELECT TO authenticated USING (public.can_view_channel(id,auth.uid()));

-- 9) Moderação V7
CREATE OR REPLACE FUNCTION public.warn_server_member(p_server_id uuid, p_user_id uuid, p_reason text DEFAULT '')
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_id bigint;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Não autenticado'; END IF;
  IF NOT public.has_server_permission(p_server_id,'KICK_MEMBERS',auth.uid()) THEN RAISE EXCEPTION 'Sem permissão'; END IF;
  INSERT INTO public.member_warnings(server_id,user_id,warned_by,reason) VALUES(p_server_id,p_user_id,auth.uid(),left(coalesce(p_reason,''),500)) RETURNING id INTO v_id;
  RETURN v_id;
END; $$;

CREATE OR REPLACE FUNCTION public.timeout_server_member(p_server_id uuid, p_user_id uuid, p_minutes integer, p_reason text DEFAULT '')
RETURNS timestamptz LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_until timestamptz;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Não autenticado'; END IF;
  IF NOT public.has_server_permission(p_server_id,'KICK_MEMBERS',auth.uid()) THEN RAISE EXCEPTION 'Sem permissão'; END IF;
  IF p_minutes < 0 OR p_minutes > 40320 THEN RAISE EXCEPTION 'Duração inválida'; END IF;
  v_until := CASE WHEN p_minutes=0 THEN NULL ELSE now()+make_interval(mins=>p_minutes) END;
  UPDATE public.server_members SET timeout_until=v_until WHERE server_id=p_server_id AND user_id=p_user_id;
  RETURN v_until;
END; $$;

REVOKE ALL ON FUNCTION public.warn_server_member(uuid,uuid,text) FROM public;
REVOKE ALL ON FUNCTION public.timeout_server_member(uuid,uuid,integer,text) FROM public;
GRANT EXECUTE ON FUNCTION public.warn_server_member(uuid,uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.timeout_server_member(uuid,uuid,integer,text) TO authenticated;

-- 10) Endurecimento de hierarquia de moderação (V7.0.6)
CREATE OR REPLACE FUNCTION public.can_moderate_member(p_server_id uuid, p_target_id uuid, p_actor_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT p_actor_id IS NOT NULL AND p_target_id IS NOT NULL AND p_actor_id<>p_target_id
    AND public.is_server_member(p_server_id,p_target_id)
    AND NOT EXISTS(SELECT 1 FROM public.servers s WHERE s.id=p_server_id AND s.owner_id=p_target_id)
    AND (
      EXISTS(SELECT 1 FROM public.servers s WHERE s.id=p_server_id AND s.owner_id=p_actor_id)
      OR (public.has_server_permission(p_server_id,'KICK_MEMBERS',p_actor_id)
          AND public.highest_role_position(p_server_id,p_actor_id)>public.highest_role_position(p_server_id,p_target_id))
    );
$$;
REVOKE ALL ON FUNCTION public.can_moderate_member(uuid,uuid,uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.can_moderate_member(uuid,uuid,uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.warn_server_member(p_server_id uuid, p_user_id uuid, p_reason text DEFAULT '')
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_id bigint;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Não autenticado'; END IF;
  IF NOT public.can_moderate_member(p_server_id,p_user_id,auth.uid()) THEN RAISE EXCEPTION 'Você não pode moderar este membro'; END IF;
  INSERT INTO public.member_warnings(server_id,user_id,warned_by,reason) VALUES(p_server_id,p_user_id,auth.uid(),left(coalesce(p_reason,''),500)) RETURNING id INTO v_id;
  INSERT INTO public.server_audit_log(server_id,actor_id,action,target_user_id,metadata) VALUES(p_server_id,auth.uid(),'warn_member',p_user_id,jsonb_build_object('reason',left(coalesce(p_reason,''),500)));
  RETURN v_id;
END; $$;

CREATE OR REPLACE FUNCTION public.timeout_server_member(p_server_id uuid, p_user_id uuid, p_minutes integer, p_reason text DEFAULT '')
RETURNS timestamptz LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_until timestamptz;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Não autenticado'; END IF;
  IF NOT public.can_moderate_member(p_server_id,p_user_id,auth.uid()) THEN RAISE EXCEPTION 'Você não pode moderar este membro'; END IF;
  IF p_minutes < 0 OR p_minutes > 40320 THEN RAISE EXCEPTION 'Duração inválida'; END IF;
  v_until := CASE WHEN p_minutes=0 THEN NULL ELSE now()+make_interval(mins=>p_minutes) END;
  UPDATE public.server_members SET timeout_until=v_until WHERE server_id=p_server_id AND user_id=p_user_id;
  INSERT INTO public.server_audit_log(server_id,actor_id,action,target_user_id,metadata) VALUES(p_server_id,auth.uid(),CASE WHEN v_until IS NULL THEN 'remove_timeout' ELSE 'timeout_member' END,p_user_id,jsonb_build_object('minutes',p_minutes,'reason',left(coalesce(p_reason,''),500),'until',v_until));
  RETURN v_until;
END; $$;

CREATE OR REPLACE FUNCTION public.ban_server_member(p_server_id uuid, p_user_id uuid, p_reason text DEFAULT '')
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_me uuid := auth.uid();
BEGIN
  IF v_me IS NULL THEN RAISE EXCEPTION 'Autenticação necessária.' USING errcode='42501'; END IF;
  IF NOT public.can_moderate_member(p_server_id,p_user_id,v_me) THEN RAISE EXCEPTION 'Você não pode banir este membro.' USING errcode='42501'; END IF;
  INSERT INTO public.server_bans(server_id,user_id,banned_by,reason) VALUES(p_server_id,p_user_id,v_me,left(coalesce(p_reason,''),300)) ON CONFLICT(server_id,user_id) DO UPDATE SET banned_by=excluded.banned_by,reason=excluded.reason,created_at=now();
  DELETE FROM public.server_members WHERE server_id=p_server_id AND user_id=p_user_id;
  INSERT INTO public.server_audit_log(server_id,actor_id,action,target_user_id,metadata) VALUES(p_server_id,v_me,'MEMBER_BAN',p_user_id,jsonb_build_object('reason',left(coalesce(p_reason,''),300)));
  RETURN true;
END; $$;

REVOKE ALL ON FUNCTION public.warn_server_member(uuid,uuid,text) FROM public;
REVOKE ALL ON FUNCTION public.timeout_server_member(uuid,uuid,integer,text) FROM public;
REVOKE ALL ON FUNCTION public.ban_server_member(uuid,uuid,text) FROM public;
GRANT EXECUTE ON FUNCTION public.warn_server_member(uuid,uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.timeout_server_member(uuid,uuid,integer,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ban_server_member(uuid,uuid,text) TO authenticated;

DROP POLICY IF EXISTS members_delete_self_or_kick ON public.server_members;
CREATE POLICY members_delete_self_or_kick ON public.server_members FOR DELETE TO authenticated USING (
  NOT EXISTS(SELECT 1 FROM public.servers s WHERE s.id=server_id AND s.owner_id=user_id)
  AND (user_id=auth.uid() OR public.can_moderate_member(server_id,user_id,auth.uid()))
);

-- 11) Força o PostgREST a reconhecer as novas colunas/funções
NOTIFY pgrst, 'reload schema';

-- Resultado final
SELECT
  'Tropa V7 reparada' AS status,
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='servers' AND column_name='banner_url') AS banner_ok,
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='servers' AND column_name='accent_color') AS accent_ok,
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='channels' AND column_name='category') AS category_ok,
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='channels' AND column_name='is_private') AS private_ok,
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='server_members' AND column_name='timeout_until') AS timeout_column_ok,
  to_regclass('public.server_notification_settings') IS NOT NULL AS notifications_ok,
  to_regprocedure('public.can_view_channel(uuid,uuid)') IS NOT NULL AS can_view_channel_ok;
