-- 1. OG listings: hide contact column from bulk reads
REVOKE SELECT ON public.og_listings FROM authenticated, anon;
GRANT SELECT (id, profile_id, user_id, username, price, currency, note, status, created_at, updated_at)
  ON public.og_listings TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.og_listings TO authenticated;
GRANT ALL ON public.og_listings TO service_role;

CREATE OR REPLACE FUNCTION public.og_listing_contact(_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT l.contact
  FROM public.og_listings l
  WHERE l.id = _id
    AND auth.uid() IS NOT NULL
    AND (l.user_id = auth.uid() OR l.status = 'active' OR public.has_role(auth.uid(), 'admin'))
$$;
REVOKE ALL ON FUNCTION public.og_listing_contact(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.og_listing_contact(uuid) TO authenticated;

-- 2. profile_likes: only own likes (or admins) are readable
DROP POLICY IF EXISTS "likes are public" ON public.profile_likes;
CREATE POLICY "own likes readable" ON public.profile_likes
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
REVOKE SELECT ON public.profile_likes FROM anon;

-- 3. user_streaks: owner-only; mirror public day counter on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS streak_days integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak_last_claim date;

CREATE OR REPLACE FUNCTION public.sync_public_streak()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles
     SET streak_days = NEW.current_days,
         streak_last_claim = NEW.last_claim_date
   WHERE user_id = NEW.user_id;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_sync_public_streak ON public.user_streaks;
CREATE TRIGGER trg_sync_public_streak
AFTER INSERT OR UPDATE ON public.user_streaks
FOR EACH ROW EXECUTE FUNCTION public.sync_public_streak();

UPDATE public.profiles p
   SET streak_days = s.current_days, streak_last_claim = s.last_claim_date
  FROM public.user_streaks s
 WHERE s.user_id = p.user_id;

DROP POLICY IF EXISTS "Streaks are public read" ON public.user_streaks;
CREATE POLICY "own streak readable" ON public.user_streaks
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
REVOKE SELECT ON public.user_streaks FROM anon;

-- 4. wall_posts: hide author identifiers from anonymous visitors
REVOKE SELECT ON public.wall_posts FROM anon;
GRANT SELECT (id, profile_id, author_name, author_avatar, message, created_at)
  ON public.wall_posts TO anon;

-- 5. gallery visibility without an anon-callable helper
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS image_host boolean NOT NULL DEFAULT false;

UPDATE public.profiles p
   SET image_host = true
 WHERE EXISTS (SELECT 1 FROM public.user_unlocks u WHERE u.user_id = p.user_id AND u.item_key = 'image-host');

CREATE OR REPLACE FUNCTION public.sync_image_host_flag()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE r record := COALESCE(NEW, OLD);
BEGIN
  IF r.item_key = 'image-host' THEN
    UPDATE public.profiles p
       SET image_host = EXISTS (
             SELECT 1 FROM public.user_unlocks u
             WHERE u.user_id = r.user_id AND u.item_key = 'image-host')
     WHERE p.user_id = r.user_id;
  END IF;
  RETURN r;
END; $$;

DROP TRIGGER IF EXISTS trg_sync_image_host_flag ON public.user_unlocks;
CREATE TRIGGER trg_sync_image_host_flag
AFTER INSERT OR DELETE ON public.user_unlocks
FOR EACH ROW EXECUTE FUNCTION public.sync_image_host_flag();

DROP POLICY IF EXISTS "public gallery of premium owners" ON public.gallery_images;
CREATE POLICY "public gallery of premium owners" ON public.gallery_images
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = gallery_images.user_id
      AND (lower(p.rank) IN ('obsidian','seraph') OR p.image_host)
  ));

-- 6. privileged SECURITY DEFINER functions: no PUBLIC/anon execute
REVOKE ALL ON FUNCTION public.gallery_is_public_owner(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_grant_coins(uuid, integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.claim_daily_reward() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.claim_mission(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.mission_progress(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.purchase_featured(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.purchase_item(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.resolve_rank_review(uuid, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rotate_login_code() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.use_community_template(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_site_owner(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.admin_grant_coins(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_daily_reward() TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_mission(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mission_progress(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.purchase_featured(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.purchase_item(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_rank_review(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rotate_login_code() TO authenticated;
GRANT EXECUTE ON FUNCTION public.use_community_template(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_site_owner(uuid) TO authenticated;