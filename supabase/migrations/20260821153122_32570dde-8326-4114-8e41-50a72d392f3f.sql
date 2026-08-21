ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;

UPDATE public.profiles p
SET view_count = (SELECT count(*) FROM public.profile_views v WHERE v.profile_id = p.id);

CREATE OR REPLACE FUNCTION public.bump_profile_view_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles SET view_count = view_count + 1 WHERE id = NEW.profile_id;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.bump_profile_view_count() FROM anon, authenticated, public;

DROP TRIGGER IF EXISTS trg_bump_profile_view_count ON public.profile_views;
CREATE TRIGGER trg_bump_profile_view_count
AFTER INSERT ON public.profile_views
FOR EACH ROW EXECUTE FUNCTION public.bump_profile_view_count();