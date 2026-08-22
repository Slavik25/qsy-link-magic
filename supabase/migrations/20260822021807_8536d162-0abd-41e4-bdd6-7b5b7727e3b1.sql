CREATE OR REPLACE FUNCTION public.grant_early_supporter()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE existing_users integer;
BEGIN
  IF NEW.user_id IS NULL THEN RETURN NEW; END IF;
  SELECT count(DISTINCT user_id) INTO existing_users
    FROM public.profiles WHERE user_id IS NOT NULL AND user_id <> NEW.user_id;
  IF existing_users < 50 THEN
    INSERT INTO public.profile_badges (profile_id, badge_key, position)
    SELECT NEW.id, 'early', coalesce((SELECT max(position) + 1 FROM public.profile_badges WHERE profile_id = NEW.id), 0)
    WHERE NOT EXISTS (
      SELECT 1 FROM public.profile_badges WHERE profile_id = NEW.id AND badge_key = 'early'
    );
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_early_supporter ON public.profiles;
CREATE TRIGGER trg_early_supporter
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.grant_early_supporter();

-- Backfill: dar la insignia a los perfiles de los primeros 50 usuarios existentes
INSERT INTO public.profile_badges (profile_id, badge_key, position)
SELECT p.id, 'early', 0
FROM public.profiles p
WHERE p.user_id IN (
  SELECT user_id FROM (
    SELECT user_id, min(created_at) AS first_seen
    FROM public.profiles WHERE user_id IS NOT NULL
    GROUP BY user_id ORDER BY first_seen ASC LIMIT 50
  ) t
)
AND NOT EXISTS (
  SELECT 1 FROM public.profile_badges b WHERE b.profile_id = p.id AND b.badge_key = 'early'
);