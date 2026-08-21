CREATE OR REPLACE FUNCTION public.sync_rank_vip_badge()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.rank IN ('obsidian','seraph') THEN
    INSERT INTO public.profile_badges (profile_id, badge_key, position)
    SELECT NEW.id, 'vip', coalesce((SELECT max(position) + 1 FROM public.profile_badges WHERE profile_id = NEW.id), 0)
    WHERE NOT EXISTS (
      SELECT 1 FROM public.profile_badges WHERE profile_id = NEW.id AND badge_key = 'vip'
    );
  ELSE
    DELETE FROM public.profile_badges WHERE profile_id = NEW.id AND badge_key = 'vip';
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_rank_vip_badge ON public.profiles;
CREATE TRIGGER trg_rank_vip_badge
AFTER INSERT OR UPDATE OF rank ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_rank_vip_badge();

INSERT INTO public.profile_badges (profile_id, badge_key, position)
SELECT p.id, 'vip', 0 FROM public.profiles p
WHERE p.rank IN ('obsidian','seraph')
  AND NOT EXISTS (SELECT 1 FROM public.profile_badges b WHERE b.profile_id = p.id AND b.badge_key = 'vip');