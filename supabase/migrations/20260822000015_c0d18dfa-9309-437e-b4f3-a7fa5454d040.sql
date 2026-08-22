ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_key;
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles (user_id);

CREATE OR REPLACE FUNCTION public.enforce_profile_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE n integer; top_rank text; lim integer;
BEGIN
  IF NEW.user_id IS NULL THEN RETURN NEW; END IF;
  SELECT count(*) INTO n FROM public.profiles WHERE user_id = NEW.user_id;
  SELECT CASE
    WHEN bool_or(rank = 'seraph') THEN 'seraph'
    WHEN bool_or(rank = 'obsidian') THEN 'obsidian'
    ELSE 'free' END
  INTO top_rank FROM public.profiles WHERE user_id = NEW.user_id;
  lim := CASE coalesce(top_rank,'free') WHEN 'seraph' THEN 5 WHEN 'obsidian' THEN 3 ELSE 2 END;
  IF n >= lim THEN
    RAISE EXCEPTION 'profile limit reached';
  END IF;
  RETURN NEW;
END; $$;

REVOKE EXECUTE ON FUNCTION public.enforce_profile_limit() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_profile_limit ON public.profiles;
CREATE TRIGGER trg_profile_limit
BEFORE INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.enforce_profile_limit();