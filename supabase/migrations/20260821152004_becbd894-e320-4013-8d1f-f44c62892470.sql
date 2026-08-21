
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  username text NOT NULL UNIQUE,
  display_name text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  avatar_url text,
  banner_url text,
  verified boolean NOT NULL DEFAULT false,
  theme jsonb NOT NULL DEFAULT '{"template":"glass","accent":"#c6f24e","blur":18,"opacity":60,"radius":16,"glow":40,"font":"inter","effects":"none","background":""}'::jsonb,
  music jsonb NOT NULL DEFAULT '{}'::jsonb,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  url text NOT NULL,
  icon text NOT NULL DEFAULT 'link',
  position integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.socials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform text NOT NULL,
  url text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, platform)
);

CREATE TABLE public.profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  country text,
  device text,
  browser text,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.link_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  link_id uuid REFERENCES public.links(id) ON DELETE SET NULL,
  label text,
  country text,
  device text,
  browser text,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_links_profile ON public.links(profile_id);
CREATE INDEX idx_socials_profile ON public.socials(profile_id);
CREATE INDEX idx_views_profile ON public.profile_views(profile_id, created_at DESC);
CREATE INDEX idx_clicks_profile ON public.link_clicks(profile_id, created_at DESC);

GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT ON public.links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.links TO authenticated;
GRANT ALL ON public.links TO service_role;

GRANT SELECT ON public.socials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.socials TO authenticated;
GRANT ALL ON public.socials TO service_role;

GRANT INSERT ON public.profile_views TO anon;
GRANT SELECT, INSERT ON public.profile_views TO authenticated;
GRANT ALL ON public.profile_views TO service_role;

GRANT INSERT ON public.link_clicks TO anon;
GRANT SELECT, INSERT ON public.link_clicks TO authenticated;
GRANT ALL ON public.link_clicks TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.socials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are publicly viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete their own profile" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Links are publicly viewable" ON public.links FOR SELECT USING (true);
CREATE POLICY "Users manage their own links" ON public.links FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = links.profile_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = links.profile_id AND p.user_id = auth.uid()));

CREATE POLICY "Socials are publicly viewable" ON public.socials FOR SELECT USING (true);
CREATE POLICY "Users manage their own socials" ON public.socials FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = socials.profile_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = socials.profile_id AND p.user_id = auth.uid()));

CREATE POLICY "Anyone can record a view" ON public.profile_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners read their views" ON public.profile_views FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_views.profile_id AND p.user_id = auth.uid()));

CREATE POLICY "Anyone can record a click" ON public.link_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners read their clicks" ON public.link_clicks FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = link_clicks.profile_id AND p.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.qsy_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.qsy_touch_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE base text; candidate text; i int := 0;
BEGIN
  base := lower(regexp_replace(coalesce(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1), 'user'), '[^a-z0-9_]', '', 'g'));
  IF base = '' THEN base := 'user'; END IF;
  candidate := base;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = candidate) LOOP
    i := i + 1; candidate := base || i::text;
  END LOOP;
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (NEW.id, candidate, coalesce(NEW.raw_user_meta_data->>'display_name', candidate));
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.profiles (username, display_name, bio, location, verified, featured, avatar_url, theme) VALUES
('brayan','Brayan','creating things that shouldn''t exist.','19 · Argentina · Multimedia',true,true,'https://i.pravatar.cc/240?img=12','{"template":"glass","accent":"#c6f24e","blur":18,"opacity":60,"radius":16,"glow":55,"font":"inter","effects":"grain","background":""}'),
('nova','Nova','sound designer & night owl','Madrid, ES',true,true,'https://i.pravatar.cc/240?img=32','{"template":"neon","accent":"#7c5cff","blur":14,"opacity":50,"radius":20,"glow":70,"font":"inter","effects":"none","background":""}'),
('kaito','Kaito','frontend dev · building weird UIs','Tokyo, JP',false,true,'https://i.pravatar.cc/240?img=15','{"template":"developer","accent":"#22d3ee","blur":10,"opacity":40,"radius":10,"glow":30,"font":"mono","effects":"none","background":""}'),
('lumi','Lumi','streamer · 3D artist','São Paulo, BR',true,false,'https://i.pravatar.cc/240?img=45','{"template":"gaming","accent":"#ff4d6d","blur":20,"opacity":65,"radius":24,"glow":60,"font":"inter","effects":"none","background":""}'),
('mira','Mira','photography & film','Berlin, DE',false,false,'https://i.pravatar.cc/240?img=27','{"template":"minimal","accent":"#e8e8e8","blur":6,"opacity":30,"radius":8,"glow":10,"font":"inter","effects":"none","background":""}'),
('zed','Zed','music producer','Buenos Aires, AR',false,false,'https://i.pravatar.cc/240?img=52','{"template":"dark","accent":"#c6f24e","blur":12,"opacity":45,"radius":14,"glow":25,"font":"inter","effects":"none","background":""}');

INSERT INTO public.links (profile_id, title, url, icon, position)
SELECT p.id, v.title, v.url, v.icon, v.pos FROM public.profiles p,
 (VALUES ('Discord','https://discord.gg/qsy','discord',0),
         ('Instagram','https://instagram.com/brayan','instagram',1),
         ('TikTok','https://tiktok.com/@brayan','tiktok',2),
         ('GitHub','https://github.com/brayan','github',3),
         ('Portfolio','https://brayan.work','globe',4)) AS v(title,url,icon,pos)
WHERE p.username = 'brayan';

INSERT INTO public.socials (profile_id, platform, url, position)
SELECT p.id, v.platform, v.url, v.pos FROM public.profiles p,
 (VALUES ('discord','https://discord.gg/qsy',0),
         ('instagram','https://instagram.com/brayan',1),
         ('tiktok','https://tiktok.com/@brayan',2),
         ('github','https://github.com/brayan',3),
         ('spotify','https://open.spotify.com/user/brayan',4),
         ('x','https://x.com/brayan',5)) AS v(platform,url,pos)
WHERE p.username = 'brayan';

INSERT INTO public.profile_views (profile_id, country, device, browser, referrer, created_at)
SELECT p.id,
  (ARRAY['AR','US','ES','BR','DE','JP'])[1 + (g % 6)],
  (ARRAY['mobile','desktop','tablet'])[1 + (g % 3)],
  (ARRAY['Chrome','Safari','Firefox','Edge'])[1 + (g % 4)],
  (ARRAY['instagram.com','tiktok.com','direct','google.com'])[1 + (g % 4)],
  now() - (g * interval '47 minutes')
FROM public.profiles p, generate_series(1, 900) g
WHERE p.username = 'brayan';

INSERT INTO public.link_clicks (profile_id, link_id, label, country, device, browser, referrer, created_at)
SELECT l.profile_id, l.id, l.title,
  (ARRAY['AR','US','ES','BR'])[1 + (g % 4)],
  (ARRAY['mobile','desktop'])[1 + (g % 2)],
  (ARRAY['Chrome','Safari','Firefox'])[1 + (g % 3)],
  (ARRAY['instagram.com','direct','tiktok.com'])[1 + (g % 3)],
  now() - (g * interval '3 hours')
FROM public.links l, generate_series(1, 60) g
WHERE l.profile_id = (SELECT id FROM public.profiles WHERE username = 'brayan');
