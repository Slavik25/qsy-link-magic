
CREATE TABLE public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  path text NOT NULL,
  url text NOT NULL,
  title text NOT NULL DEFAULT '',
  size_bytes bigint NOT NULL DEFAULT 0,
  content_type text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_images TO authenticated;
GRANT ALL ON public.gallery_images TO service_role;

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own gallery select" ON public.gallery_images
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own gallery insert" ON public.gallery_images
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own gallery update" ON public.gallery_images
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "own gallery delete" ON public.gallery_images
  FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE INDEX gallery_images_user_idx ON public.gallery_images (user_id, created_at DESC);

-- Shop access item
INSERT INTO public.shop_price_reference (key, price) VALUES ('image-host', 2500)
  ON CONFLICT (key) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO public.shop_items (key, kind, price) VALUES ('image-host', 'access', 2500)
  ON CONFLICT (key) DO NOTHING;

-- Badge grant helpers
CREATE OR REPLACE FUNCTION public.grant_imagehost_badge_for_user(_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profile_badges (profile_id, badge_key, position)
  SELECT p.id, 'imagehost',
         coalesce((SELECT max(position) + 1 FROM public.profile_badges b WHERE b.profile_id = p.id), 0)
  FROM public.profiles p
  WHERE p.user_id = _user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.profile_badges b WHERE b.profile_id = p.id AND b.badge_key = 'imagehost'
    );
END; $$;

CREATE OR REPLACE FUNCTION public.sync_imagehost_badge_unlock()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.item_key = 'image-host' THEN
    PERFORM public.grant_imagehost_badge_for_user(NEW.user_id);
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_imagehost_badge_unlock
AFTER INSERT ON public.user_unlocks
FOR EACH ROW EXECUTE FUNCTION public.sync_imagehost_badge_unlock();

CREATE OR REPLACE FUNCTION public.sync_imagehost_badge_rank()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.rank IN ('obsidian','seraph') THEN
    INSERT INTO public.profile_badges (profile_id, badge_key, position)
    SELECT NEW.id, 'imagehost',
           coalesce((SELECT max(position) + 1 FROM public.profile_badges WHERE profile_id = NEW.id), 0)
    WHERE NOT EXISTS (
      SELECT 1 FROM public.profile_badges WHERE profile_id = NEW.id AND badge_key = 'imagehost'
    );
  ELSIF NOT EXISTS (
    SELECT 1 FROM public.user_unlocks u WHERE u.user_id = NEW.user_id AND u.item_key = 'image-host'
  ) THEN
    DELETE FROM public.profile_badges WHERE profile_id = NEW.id AND badge_key = 'imagehost';
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_imagehost_badge_rank
AFTER INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_imagehost_badge_rank();

-- Backfill for current premium members and buyers
INSERT INTO public.profile_badges (profile_id, badge_key, position)
SELECT p.id, 'imagehost', 0
FROM public.profiles p
WHERE (p.rank IN ('obsidian','seraph')
       OR EXISTS (SELECT 1 FROM public.user_unlocks u WHERE u.user_id = p.user_id AND u.item_key = 'image-host'))
  AND NOT EXISTS (SELECT 1 FROM public.profile_badges b WHERE b.profile_id = p.id AND b.badge_key = 'imagehost');
