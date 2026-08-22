-- 1) Protect sensitive profile columns from client-side tampering
CREATE OR REPLACE FUNCTION public.guard_profile_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF current_user IN ('anon', 'authenticated') AND NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.view_count := OLD.view_count;
    NEW.like_count := OLD.like_count;
    NEW.uid := OLD.uid;
    NEW.rank := OLD.rank;
    NEW.verified := OLD.verified;
    NEW.featured := OLD.featured;
    NEW.domain := OLD.domain;
  END IF;
  RETURN NEW;
END; $$;

REVOKE ALL ON FUNCTION public.guard_profile_columns() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_guard_profile_columns ON public.profiles;
CREATE TRIGGER trg_guard_profile_columns
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.guard_profile_columns();

-- 2) Recompute inflated counters from real rows
UPDATE public.profiles p SET
  view_count = COALESCE((SELECT count(*) FROM public.profile_views v WHERE v.profile_id = p.id), 0),
  like_count = COALESCE((SELECT count(*) FROM public.profile_likes l WHERE l.profile_id = p.id), 0);

-- 3) Global chat anti-spam
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
  IF n >= 5 THEN
    RAISE EXCEPTION 'estás enviando mensajes demasiado rápido';
  END IF;

  SELECT count(*) INTO n FROM public.global_chat_messages
    WHERE user_id = NEW.user_id AND created_at > now() - interval '5 minutes';
  IF n >= 30 THEN
    RAISE EXCEPTION 'límite de mensajes alcanzado, espera un momento';
  END IF;

  -- avoid identical message flooding
  IF EXISTS (
    SELECT 1 FROM public.global_chat_messages
    WHERE user_id = NEW.user_id AND message = NEW.message
      AND created_at > now() - interval '60 seconds'
  ) THEN
    RAISE EXCEPTION 'mensaje duplicado';
  END IF;

  RETURN NEW;
END; $$;

REVOKE ALL ON FUNCTION public.chat_rate_limit() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_chat_rate_limit ON public.global_chat_messages;
CREATE TRIGGER trg_chat_rate_limit
BEFORE INSERT ON public.global_chat_messages
FOR EACH ROW EXECUTE FUNCTION public.chat_rate_limit();

-- 4) Tighter analytics rate limit
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
    IF n >= 20 THEN
      RAISE EXCEPTION 'rate limit exceeded';
    END IF;
  ELSE
    SELECT count(*) INTO n FROM public.link_clicks
      WHERE profile_id = NEW.profile_id AND created_at > now() - interval '1 minute';
    IF n >= 40 THEN
      RAISE EXCEPTION 'rate limit exceeded';
    END IF;
  END IF;
  RETURN NEW;
END; $$;