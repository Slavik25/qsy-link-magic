-- IP / fingerprint tracking columns
ALTER TABLE public.global_chat_messages ADD COLUMN IF NOT EXISTS ip text;
ALTER TABLE public.global_chat_messages ADD COLUMN IF NOT EXISTS fingerprint text;
ALTER TABLE public.profile_views ADD COLUMN IF NOT EXISTS ip text;
ALTER TABLE public.profile_views ADD COLUMN IF NOT EXISTS fingerprint text;

CREATE INDEX IF NOT EXISTS idx_chat_ip_created ON public.global_chat_messages (ip, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_user_created ON public.global_chat_messages (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_views_ip_created ON public.profile_views (ip, created_at DESC);

-- Audit trail
CREATE TABLE IF NOT EXISTS public.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  action text NOT NULL,
  actor_user_id uuid,
  actor_name text NOT NULL DEFAULT 'anon',
  profile_id uuid,
  target_id uuid,
  source text NOT NULL DEFAULT 'web',
  ip text,
  user_agent text,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_kind_created ON public.audit_events (kind, created_at DESC);

GRANT SELECT ON public.audit_events TO authenticated;
GRANT ALL ON public.audit_events TO service_role;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins read audit" ON public.audit_events;
CREATE POLICY "admins read audit" ON public.audit_events
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Chat reports / moderation queue
CREATE TABLE IF NOT EXISTS public.chat_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid,
  message_text text NOT NULL DEFAULT '',
  message_author_id uuid,
  message_author_name text NOT NULL DEFAULT '',
  reporter_id uuid NOT NULL,
  reporter_name text NOT NULL DEFAULT '',
  reason text NOT NULL DEFAULT 'abuso',
  note text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_reports_unique ON public.chat_reports (message_id, reporter_id);
CREATE INDEX IF NOT EXISTS idx_chat_reports_status ON public.chat_reports (status, created_at DESC);

GRANT SELECT, INSERT ON public.chat_reports TO authenticated;
GRANT UPDATE, DELETE ON public.chat_reports TO authenticated;
GRANT ALL ON public.chat_reports TO service_role;
ALTER TABLE public.chat_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users create reports" ON public.chat_reports;
CREATE POLICY "users create reports" ON public.chat_reports
FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "reporters read own" ON public.chat_reports;
CREATE POLICY "reporters read own" ON public.chat_reports
FOR SELECT TO authenticated USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "admins read reports" ON public.chat_reports;
CREATE POLICY "admins read reports" ON public.chat_reports
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins resolve reports" ON public.chat_reports;
CREATE POLICY "admins resolve reports" ON public.chat_reports
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins delete reports" ON public.chat_reports;
CREATE POLICY "admins delete reports" ON public.chat_reports
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Per-IP rate limits enforced at DB level as a second line of defence
CREATE OR REPLACE FUNCTION public.chat_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE n integer;
BEGIN
  NEW.message := btrim(NEW.message);
  IF NEW.message = '' OR length(NEW.message) > 500 THEN
    RAISE EXCEPTION 'mensaje inválido';
  END IF;

  SELECT count(*) INTO n FROM public.global_chat_messages
    WHERE user_id = NEW.user_id AND created_at > now() - interval '15 seconds';
  IF n >= 5 THEN RAISE EXCEPTION 'estás enviando mensajes demasiado rápido'; END IF;

  SELECT count(*) INTO n FROM public.global_chat_messages
    WHERE user_id = NEW.user_id AND created_at > now() - interval '5 minutes';
  IF n >= 30 THEN RAISE EXCEPTION 'límite de mensajes alcanzado, espera un momento'; END IF;

  IF NEW.ip IS NOT NULL AND NEW.ip <> '' THEN
    SELECT count(*) INTO n FROM public.global_chat_messages
      WHERE ip = NEW.ip AND created_at > now() - interval '15 seconds';
    IF n >= 8 THEN RAISE EXCEPTION 'demasiados mensajes desde tu conexión'; END IF;

    SELECT count(*) INTO n FROM public.global_chat_messages
      WHERE ip = NEW.ip AND created_at > now() - interval '5 minutes';
    IF n >= 60 THEN RAISE EXCEPTION 'límite por conexión alcanzado'; END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.global_chat_messages
    WHERE user_id = NEW.user_id AND message = NEW.message
      AND created_at > now() - interval '60 seconds'
  ) THEN
    RAISE EXCEPTION 'mensaje duplicado';
  END IF;

  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.analytics_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE n integer;
BEGIN
  IF TG_TABLE_NAME = 'profile_views' THEN
    SELECT count(*) INTO n FROM public.profile_views
      WHERE profile_id = NEW.profile_id AND created_at > now() - interval '1 minute';
    IF n >= 20 THEN RAISE EXCEPTION 'rate limit exceeded'; END IF;

    IF NEW.ip IS NOT NULL AND NEW.ip <> '' THEN
      SELECT count(*) INTO n FROM public.profile_views
        WHERE ip = NEW.ip AND profile_id = NEW.profile_id
          AND created_at > now() - interval '6 hours';
      IF n >= 1 THEN RAISE EXCEPTION 'visita ya registrada desde esta conexión'; END IF;

      SELECT count(*) INTO n FROM public.profile_views
        WHERE ip = NEW.ip AND created_at > now() - interval '1 minute';
      IF n >= 10 THEN RAISE EXCEPTION 'rate limit exceeded'; END IF;
    END IF;
  ELSE
    SELECT count(*) INTO n FROM public.link_clicks
      WHERE profile_id = NEW.profile_id AND created_at > now() - interval '1 minute';
    IF n >= 40 THEN RAISE EXCEPTION 'rate limit exceeded'; END IF;
  END IF;
  RETURN NEW;
END; $$;

REVOKE ALL ON FUNCTION public.chat_rate_limit() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.analytics_rate_limit() FROM PUBLIC, anon, authenticated;