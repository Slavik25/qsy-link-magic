-- 1) Stricter rate limiting for views and link clicks
CREATE OR REPLACE FUNCTION public.analytics_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE n integer;
DECLARE fp text;
BEGIN
  IF TG_TABLE_NAME = 'profile_views' THEN
    fp := nullif(NEW.fingerprint, '');

    SELECT count(*) INTO n FROM public.profile_views
      WHERE profile_id = NEW.profile_id AND created_at > now() - interval '1 minute';
    IF n >= 8 THEN RAISE EXCEPTION 'rate limit exceeded'; END IF;

    SELECT count(*) INTO n FROM public.profile_views
      WHERE profile_id = NEW.profile_id AND created_at > now() - interval '1 hour';
    IF n >= 120 THEN RAISE EXCEPTION 'rate limit exceeded'; END IF;

    IF fp IS NOT NULL THEN
      SELECT count(*) INTO n FROM public.profile_views
        WHERE fingerprint = fp AND profile_id = NEW.profile_id
          AND created_at > now() - interval '12 hours';
      IF n >= 1 THEN RAISE EXCEPTION 'visita ya registrada desde este dispositivo'; END IF;

      SELECT count(*) INTO n FROM public.profile_views
        WHERE fingerprint = fp AND created_at > now() - interval '1 minute';
      IF n >= 3 THEN RAISE EXCEPTION 'rate limit exceeded'; END IF;
    END IF;

    IF NEW.ip IS NOT NULL AND NEW.ip <> '' THEN
      SELECT count(*) INTO n FROM public.profile_views
        WHERE ip = NEW.ip AND profile_id = NEW.profile_id
          AND created_at > now() - interval '12 hours';
      IF n >= 1 THEN RAISE EXCEPTION 'visita ya registrada desde esta conexión'; END IF;

      SELECT count(*) INTO n FROM public.profile_views
        WHERE ip = NEW.ip AND created_at > now() - interval '1 minute';
      IF n >= 5 THEN RAISE EXCEPTION 'rate limit exceeded'; END IF;

      SELECT count(*) INTO n FROM public.profile_views
        WHERE ip = NEW.ip AND created_at > now() - interval '1 hour';
      IF n >= 60 THEN RAISE EXCEPTION 'rate limit exceeded'; END IF;
    END IF;
  ELSE
    SELECT count(*) INTO n FROM public.link_clicks
      WHERE profile_id = NEW.profile_id AND created_at > now() - interval '1 minute';
    IF n >= 20 THEN RAISE EXCEPTION 'rate limit exceeded'; END IF;

    SELECT count(*) INTO n FROM public.link_clicks
      WHERE profile_id = NEW.profile_id AND created_at > now() - interval '1 hour';
    IF n >= 300 THEN RAISE EXCEPTION 'rate limit exceeded'; END IF;
  END IF;
  RETURN NEW;
END; $function$;

-- 2) Rate limiting + anti-tampering for likes
CREATE OR REPLACE FUNCTION public.likes_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE n integer;
DECLARE uid uuid := auth.uid();
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF uid IS NULL THEN RAISE EXCEPTION 'login requerido para dar like'; END IF;
    IF NEW.user_id IS DISTINCT FROM uid THEN RAISE EXCEPTION 'like inválido'; END IF;

    SELECT count(*) INTO n FROM public.profile_likes
      WHERE user_id = uid AND created_at > now() - interval '1 minute';
    IF n >= 5 THEN RAISE EXCEPTION 'demasiados likes, esperá un momento'; END IF;

    SELECT count(*) INTO n FROM public.profile_likes
      WHERE user_id = uid AND created_at > now() - interval '1 hour';
    IF n >= 60 THEN RAISE EXCEPTION 'demasiados likes, esperá un momento'; END IF;

    SELECT count(*) INTO n FROM public.profile_likes
      WHERE profile_id = NEW.profile_id AND created_at > now() - interval '1 minute';
    IF n >= 20 THEN RAISE EXCEPTION 'rate limit exceeded'; END IF;

    RETURN NEW;
  ELSE
    IF uid IS NULL OR OLD.user_id IS DISTINCT FROM uid THEN
      RAISE EXCEPTION 'no autorizado';
    END IF;
    IF OLD.created_at > now() - interval '3 seconds' THEN
      RAISE EXCEPTION 'esperá un momento antes de quitar el like';
    END IF;
    RETURN OLD;
  END IF;
END; $function$;

DROP TRIGGER IF EXISTS trg_profile_likes_rate ON public.profile_likes;
CREATE TRIGGER trg_profile_likes_rate
BEFORE INSERT OR DELETE ON public.profile_likes
FOR EACH ROW EXECUTE FUNCTION public.likes_rate_limit();

-- 3) Audit trail: likes
CREATE OR REPLACE FUNCTION public.audit_profile_likes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE r record := COALESCE(NEW, OLD);
BEGIN
  INSERT INTO public.audit_events (kind, action, actor_user_id, actor_name, profile_id, target_id, source, detail)
  VALUES (
    'like',
    CASE WHEN TG_OP = 'INSERT' THEN 'like_added' ELSE 'like_removed' END,
    auth.uid(),
    COALESCE((SELECT username FROM public.profiles WHERE user_id = auth.uid() LIMIT 1), 'anon'),
    r.profile_id,
    r.id,
    'db',
    jsonb_build_object('op', TG_OP)
  );
  RETURN r;
END; $function$;

DROP TRIGGER IF EXISTS trg_audit_profile_likes ON public.profile_likes;
CREATE TRIGGER trg_audit_profile_likes
AFTER INSERT OR DELETE ON public.profile_likes
FOR EACH ROW EXECUTE FUNCTION public.audit_profile_likes();

-- 4) Audit trail: role changes
CREATE OR REPLACE FUNCTION public.audit_user_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE r record := COALESCE(NEW, OLD);
BEGIN
  INSERT INTO public.audit_events (kind, action, actor_user_id, actor_name, target_id, source, detail)
  VALUES (
    'role',
    CASE WHEN TG_OP = 'INSERT' THEN 'role_granted' ELSE 'role_revoked' END,
    auth.uid(),
    COALESCE((SELECT username FROM public.profiles WHERE user_id = auth.uid() LIMIT 1), 'system'),
    r.id,
    'db',
    jsonb_build_object('role', r.role, 'user_id', r.user_id)
  );
  RETURN r;
END; $function$;

DROP TRIGGER IF EXISTS trg_audit_user_roles ON public.user_roles;
CREATE TRIGGER trg_audit_user_roles
AFTER INSERT OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.audit_user_roles();

-- 5) Audit trail: manual changes to visit/like counters
CREATE OR REPLACE FUNCTION public.audit_profile_counters()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF current_setting('app.counter_override', true) = 'on' THEN
    RETURN NEW;
  END IF;
  IF NEW.view_count IS DISTINCT FROM OLD.view_count OR NEW.like_count IS DISTINCT FROM OLD.like_count THEN
    INSERT INTO public.audit_events (kind, action, actor_user_id, actor_name, profile_id, target_id, source, detail)
    VALUES (
      'counter',
      'counter_changed',
      auth.uid(),
      COALESCE((SELECT username FROM public.profiles WHERE user_id = auth.uid() LIMIT 1), 'system'),
      NEW.id,
      NEW.id,
      'db',
      jsonb_build_object(
        'view_count_before', OLD.view_count, 'view_count_after', NEW.view_count,
        'like_count_before', OLD.like_count, 'like_count_after', NEW.like_count
      )
    );
  END IF;
  RETURN NEW;
END; $function$;

DROP TRIGGER IF EXISTS trg_audit_profile_counters ON public.profiles;
CREATE TRIGGER trg_audit_profile_counters
AFTER UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.audit_profile_counters();

-- 6) Audit trail: mirror every admin panel action into audit_events
CREATE OR REPLACE FUNCTION public.audit_admin_actions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.audit_events (kind, action, actor_user_id, actor_name, target_id, source, detail)
  VALUES ('admin', NEW.action, NEW.actor_id, NEW.actor_name, NEW.id, 'admin_panel',
          jsonb_build_object('target', NEW.target) || COALESCE(NEW.meta, '{}'::jsonb));
  RETURN NEW;
END; $function$;

DROP TRIGGER IF EXISTS trg_audit_admin_actions ON public.admin_audit_log;
CREATE TRIGGER trg_audit_admin_actions
AFTER INSERT ON public.admin_audit_log
FOR EACH ROW EXECUTE FUNCTION public.audit_admin_actions();