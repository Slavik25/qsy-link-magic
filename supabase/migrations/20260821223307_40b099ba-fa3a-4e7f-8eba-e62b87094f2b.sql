
-- Validate analytics inserts
DROP POLICY IF EXISTS "Anyone can insert profile views" ON public.profile_views;
DROP POLICY IF EXISTS "Public can insert profile views" ON public.profile_views;
DROP POLICY IF EXISTS "anyone_insert_profile_views" ON public.profile_views;

CREATE POLICY "Validated profile view inserts"
ON public.profile_views FOR INSERT TO anon, authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id));

DROP POLICY IF EXISTS "Anyone can insert link clicks" ON public.link_clicks;
DROP POLICY IF EXISTS "Public can insert link clicks" ON public.link_clicks;
DROP POLICY IF EXISTS "anyone_insert_link_clicks" ON public.link_clicks;

CREATE POLICY "Validated link click inserts"
ON public.link_clicks FOR INSERT TO anon, authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id)
  AND (link_id IS NULL OR EXISTS (SELECT 1 FROM public.links l WHERE l.id = link_id AND l.profile_id = profile_id))
);

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
  ELSE
    SELECT count(*) INTO n FROM public.link_clicks
      WHERE profile_id = NEW.profile_id AND created_at > now() - interval '1 minute';
  END IF;
  IF n >= 120 THEN
    RAISE EXCEPTION 'rate limit exceeded';
  END IF;
  RETURN NEW;
END; $$;

REVOKE ALL ON FUNCTION public.analytics_rate_limit() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_profile_views_rate ON public.profile_views;
CREATE TRIGGER trg_profile_views_rate BEFORE INSERT ON public.profile_views
FOR EACH ROW EXECUTE FUNCTION public.analytics_rate_limit();

DROP TRIGGER IF EXISTS trg_link_clicks_rate ON public.link_clicks;
CREATE TRIGGER trg_link_clicks_rate BEFORE INSERT ON public.link_clicks
FOR EACH ROW EXECUTE FUNCTION public.analytics_rate_limit();
