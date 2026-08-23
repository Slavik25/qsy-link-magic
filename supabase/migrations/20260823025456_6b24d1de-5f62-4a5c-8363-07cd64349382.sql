DROP TRIGGER IF EXISTS profiles_sync_og_badge ON public.profiles;

CREATE OR REPLACE FUNCTION public.sync_og_badge()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.uid IS NOT NULL AND NEW.uid <= 50 THEN
    INSERT INTO public.profile_badges (profile_id, badge_key)
    SELECT NEW.id, 'og'
    WHERE NOT EXISTS (
      SELECT 1 FROM public.profile_badges b WHERE b.profile_id = NEW.id AND b.badge_key = 'og'
    );
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_og_badge() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER profiles_sync_og_badge
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_og_badge();

DELETE FROM public.profile_badges b
USING public.profiles p
WHERE b.profile_id = p.id AND b.badge_key = 'og' AND (p.uid IS NULL OR p.uid > 50);

INSERT INTO public.profile_badges (profile_id, badge_key)
SELECT p.id, 'og' FROM public.profiles p
WHERE p.uid IS NOT NULL AND p.uid <= 50
  AND NOT EXISTS (SELECT 1 FROM public.profile_badges b WHERE b.profile_id = p.id AND b.badge_key = 'og');