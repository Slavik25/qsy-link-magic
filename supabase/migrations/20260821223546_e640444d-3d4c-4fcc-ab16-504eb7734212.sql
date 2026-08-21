
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS rank text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS domain text NOT NULL DEFAULT 'qsy.rip';

CREATE OR REPLACE FUNCTION public.enforce_profile_domain()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.rank NOT IN ('free','obsidian','seraph') THEN
    RAISE EXCEPTION 'invalid rank';
  END IF;
  IF NEW.domain NOT IN ('qsy.rip','qsy.es','qsy.bio') THEN
    RAISE EXCEPTION 'invalid domain';
  END IF;
  -- only admins may change rank
  IF TG_OP = 'UPDATE' AND NEW.rank IS DISTINCT FROM OLD.rank
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.rank := OLD.rank;
  END IF;
  IF TG_OP = 'INSERT' AND NEW.rank <> 'free' AND NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.rank := 'free';
  END IF;
  -- non-seraph profiles stay on the default domain
  IF NEW.rank <> 'seraph' THEN
    NEW.domain := 'qsy.rip';
  END IF;
  RETURN NEW;
END; $$;

REVOKE ALL ON FUNCTION public.enforce_profile_domain() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_profiles_domain ON public.profiles;
CREATE TRIGGER trg_profiles_domain BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.enforce_profile_domain();
