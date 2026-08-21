-- Wallet
CREATE TABLE public.user_wallets (
  user_id uuid PRIMARY KEY,
  coins integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.user_wallets TO authenticated;
GRANT ALL ON public.user_wallets TO service_role;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own wallet" ON public.user_wallets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins read wallets" ON public.user_wallets FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Mission claims
CREATE TABLE public.mission_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mission_key text NOT NULL,
  reward integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, mission_key)
);
GRANT SELECT ON public.mission_claims TO authenticated;
GRANT ALL ON public.mission_claims TO service_role;
ALTER TABLE public.mission_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own claims" ON public.mission_claims FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Shop items (price source of truth)
CREATE TABLE public.shop_items (
  key text PRIMARY KEY,
  kind text NOT NULL DEFAULT 'decoration',
  price integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.shop_items TO authenticated, anon;
GRANT ALL ON public.shop_items TO service_role;
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shop items are public" ON public.shop_items FOR SELECT USING (true);
CREATE POLICY "admins manage shop items" ON public.shop_items FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Unlocks
CREATE TABLE public.user_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_key)
);
GRANT SELECT ON public.user_unlocks TO authenticated;
GRANT ALL ON public.user_unlocks TO service_role;
ALTER TABLE public.user_unlocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own unlocks" ON public.user_unlocks FOR SELECT TO authenticated USING (auth.uid() = user_id);

INSERT INTO public.shop_items (key, kind, price) VALUES
  ('aurora','decoration',200),
  ('inferno','decoration',250),
  ('matrix','decoration',250),
  ('sakura','decoration',300),
  ('gold','decoration',500),
  ('cyber','decoration',400),
  ('player-structured','player',250),
  ('player-text','player',250),
  ('layout-compact','layout',150),
  ('layout-wide','layout',300),
  ('layout-hex','layout',400);

-- Mission progress for the current user
CREATE OR REPLACE FUNCTION public.mission_progress(_key text)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE uid uuid := auth.uid(); v integer := 0;
BEGIN
  IF uid IS NULL THEN RETURN 0; END IF;
  IF _key = 'links_10' THEN
    SELECT count(*) INTO v FROM links l JOIN profiles p ON p.id = l.profile_id WHERE p.user_id = uid;
  ELSIF _key = 'views_100' OR _key = 'views_1000' THEN
    SELECT coalesce(sum(view_count),0) INTO v FROM profiles WHERE user_id = uid;
  ELSIF _key = 'likes_50' THEN
    SELECT coalesce(sum(like_count),0) INTO v FROM profiles WHERE user_id = uid;
  ELSIF _key = 'wall_25' THEN
    SELECT count(*) INTO v FROM wall_posts w JOIN profiles p ON p.id = w.profile_id WHERE p.user_id = uid;
  ELSIF _key = 'chat_50' THEN
    SELECT count(*) INTO v FROM global_chat_messages WHERE user_id = uid;
  ELSIF _key = 'badges_5' THEN
    SELECT count(*) INTO v FROM profile_badges b JOIN profiles p ON p.id = b.profile_id WHERE p.user_id = uid;
  ELSIF _key = 'verified' THEN
    SELECT count(*) INTO v FROM profiles WHERE user_id = uid AND verified;
  ELSIF _key = 'two_profiles' THEN
    SELECT count(*) INTO v FROM profiles WHERE user_id = uid;
  ELSIF _key = 'bio_complete' THEN
    SELECT count(*) INTO v FROM profiles WHERE user_id = uid AND length(bio) > 20 AND avatar_url IS NOT NULL AND banner_url IS NOT NULL;
  END IF;
  RETURN v;
END; $$;
REVOKE EXECUTE ON FUNCTION public.mission_progress(text) FROM public;
GRANT EXECUTE ON FUNCTION public.mission_progress(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.claim_mission(_key text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE uid uuid := auth.uid(); goal integer; reward integer; prog integer; bal integer;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT * INTO goal, reward FROM (VALUES
    ('links_10', 10, 200),
    ('views_100', 100, 300),
    ('views_1000', 1000, 800),
    ('likes_50', 50, 400),
    ('wall_25', 25, 350),
    ('chat_50', 50, 250),
    ('badges_5', 5, 600),
    ('verified', 1, 1000),
    ('two_profiles', 2, 150),
    ('bio_complete', 1, 250)
  ) AS t(k, g, r) WHERE t.k = _key LIMIT 1;
  IF goal IS NULL THEN RAISE EXCEPTION 'unknown mission'; END IF;
  prog := public.mission_progress(_key);
  IF prog < goal THEN RAISE EXCEPTION 'mission not completed'; END IF;
  IF EXISTS (SELECT 1 FROM mission_claims WHERE user_id = uid AND mission_key = _key) THEN
    RAISE EXCEPTION 'already claimed';
  END IF;
  INSERT INTO mission_claims (user_id, mission_key, reward) VALUES (uid, _key, reward);
  INSERT INTO user_wallets (user_id, coins) VALUES (uid, reward)
    ON CONFLICT (user_id) DO UPDATE SET coins = user_wallets.coins + reward, updated_at = now();
  SELECT coins INTO bal FROM user_wallets WHERE user_id = uid;
  RETURN bal;
END; $$;
REVOKE EXECUTE ON FUNCTION public.claim_mission(text) FROM public;
GRANT EXECUTE ON FUNCTION public.claim_mission(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.purchase_item(_key text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE uid uuid := auth.uid(); cost integer; bal integer;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT price INTO cost FROM shop_items WHERE key = _key;
  IF cost IS NULL THEN RAISE EXCEPTION 'unknown item'; END IF;
  IF EXISTS (SELECT 1 FROM user_unlocks WHERE user_id = uid AND item_key = _key) THEN
    SELECT coalesce(coins,0) INTO bal FROM user_wallets WHERE user_id = uid;
    RETURN coalesce(bal,0);
  END IF;
  SELECT coalesce(coins,0) INTO bal FROM user_wallets WHERE user_id = uid;
  IF coalesce(bal,0) < cost THEN RAISE EXCEPTION 'not enough coins'; END IF;
  UPDATE user_wallets SET coins = coins - cost, updated_at = now() WHERE user_id = uid;
  INSERT INTO user_unlocks (user_id, item_key) VALUES (uid, _key);
  SELECT coins INTO bal FROM user_wallets WHERE user_id = uid;
  RETURN bal;
END; $$;
REVOKE EXECUTE ON FUNCTION public.purchase_item(text) FROM public;
GRANT EXECUTE ON FUNCTION public.purchase_item(text) TO authenticated;