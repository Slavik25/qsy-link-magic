
-- dedupe existing likes
DELETE FROM public.profile_likes a USING public.profile_likes b
WHERE a.ctid < b.ctid AND a.profile_id = b.profile_id AND a.user_id = b.user_id AND a.user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profile_likes_unique_user ON public.profile_likes(profile_id, user_id) WHERE user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_profile_like_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET like_count = like_count + 1 WHERE id = NEW.profile_id;
    RETURN NEW;
  ELSE
    UPDATE public.profiles SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.profile_id;
    RETURN OLD;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS profile_likes_count ON public.profile_likes;
CREATE TRIGGER profile_likes_count
AFTER INSERT OR DELETE ON public.profile_likes
FOR EACH ROW EXECUTE FUNCTION public.sync_profile_like_count();

-- resync current counts
UPDATE public.profiles p
SET like_count = COALESCE((SELECT count(*) FROM public.profile_likes l WHERE l.profile_id = p.id), 0);

-- keep profiles.view_count in sync with recorded views
CREATE OR REPLACE FUNCTION public.sync_profile_view_count()
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

DROP TRIGGER IF EXISTS profile_views_count ON public.profile_views;
CREATE TRIGGER profile_views_count
AFTER INSERT ON public.profile_views
FOR EACH ROW EXECUTE FUNCTION public.sync_profile_view_count();

UPDATE public.profiles p
SET view_count = COALESCE((SELECT count(*) FROM public.profile_views v WHERE v.profile_id = p.id), 0);
