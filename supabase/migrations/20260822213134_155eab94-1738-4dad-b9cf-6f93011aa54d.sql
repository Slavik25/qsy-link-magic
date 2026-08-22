CREATE OR REPLACE FUNCTION public.mission_progress(_key text)
RETURNS integer LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); v integer := 0;
BEGIN
  IF _uid IS NULL THEN RETURN 0; END IF;
  IF _key = 'links_10' THEN
    SELECT count(*) INTO v FROM links l JOIN profiles p ON p.id = l.profile_id WHERE p.user_id = _uid;
  ELSIF _key = 'views_100' OR _key = 'views_1000' THEN
    SELECT coalesce(sum(view_count),0) INTO v FROM profiles WHERE user_id = _uid;
  ELSIF _key = 'likes_50' THEN
    SELECT coalesce(sum(like_count),0) INTO v FROM profiles WHERE user_id = _uid;
  ELSIF _key = 'wall_25' THEN
    SELECT count(*) INTO v FROM wall_posts w JOIN profiles p ON p.id = w.profile_id WHERE p.user_id = _uid;
  ELSIF _key = 'chat_50' THEN
    SELECT count(*) INTO v FROM global_chat_messages WHERE user_id = _uid;
  ELSIF _key = 'badges_5' THEN
    SELECT count(*) INTO v FROM profile_badges b JOIN profiles p ON p.id = b.profile_id WHERE p.user_id = _uid;
  ELSIF _key = 'verified' THEN
    SELECT count(*) INTO v FROM profiles WHERE user_id = _uid AND verified;
  ELSIF _key = 'two_profiles' THEN
    SELECT count(*) INTO v FROM profiles WHERE user_id = _uid;
  ELSIF _key = 'bio_complete' THEN
    SELECT count(*) INTO v FROM profiles WHERE user_id = _uid AND length(bio) > 20 AND avatar_url IS NOT NULL AND banner_url IS NOT NULL;
  END IF;
  RETURN v;
END; $$;

CREATE OR REPLACE FUNCTION public.claim_mission(_key text)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); goal integer; reward integer; prog integer; bal integer;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT t.g, t.r INTO goal, reward FROM (VALUES
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
  IF EXISTS (SELECT 1 FROM public.mission_claims WHERE user_id = _uid AND mission_key = _key) THEN
    RAISE EXCEPTION 'already claimed';
  END IF;
  INSERT INTO public.mission_claims (user_id, mission_key, reward) VALUES (_uid, _key, reward);
  PERFORM set_config('app.economy_override', 'on', true);
  INSERT INTO public.user_wallets (user_id, coins) VALUES (_uid, reward)
    ON CONFLICT (user_id) DO UPDATE SET coins = public.user_wallets.coins + reward, updated_at = now();
  SELECT coins INTO bal FROM public.user_wallets WHERE user_id = _uid;
  PERFORM set_config('app.economy_override', 'off', true);
  INSERT INTO public.audit_events (kind, action, actor_user_id, actor_name, source, detail)
  VALUES ('shop','mission_claimed',_uid,
          COALESCE((SELECT username FROM public.profiles WHERE user_id = _uid LIMIT 1),'user'),
          'db', jsonb_build_object('mission',_key,'reward',reward,'balance_after',bal));
  RETURN bal;
END; $$;

CREATE OR REPLACE FUNCTION public.purchase_item(_key text)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); cost integer; listed integer; bal integer; uname text;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  uname := COALESCE((SELECT username FROM public.profiles WHERE user_id = _uid LIMIT 1), 'user');

  SELECT price INTO listed FROM public.shop_items WHERE key = _key;
  SELECT price INTO cost FROM public.shop_price_reference WHERE key = _key;

  IF cost IS NULL THEN
    INSERT INTO public.audit_events (kind, action, actor_user_id, actor_name, source, detail)
    VALUES ('shop','purchase_rejected',_uid,uname,'db',jsonb_build_object('item',_key,'reason','unknown_item'));
    RAISE EXCEPTION 'unknown item';
  END IF;

  IF listed IS DISTINCT FROM cost THEN
    INSERT INTO public.audit_events (kind, action, actor_user_id, actor_name, source, detail)
    VALUES ('shop','price_mismatch_detected',_uid,uname,'db',
            jsonb_build_object('item',_key,'listed',listed,'official',cost));
    PERFORM set_config('app.shop_repair', 'on', true);
    UPDATE public.shop_items SET price = cost WHERE key = _key;
  END IF;

  IF EXISTS (SELECT 1 FROM public.user_unlocks WHERE user_id = _uid AND item_key = _key) THEN
    SELECT COALESCE(coins,0) INTO bal FROM public.user_wallets WHERE user_id = _uid;
    RETURN COALESCE(bal,0);
  END IF;

  PERFORM set_config('app.economy_override', 'on', true);

  IF cost > 0 THEN
    SELECT COALESCE(coins,0) INTO bal FROM public.user_wallets WHERE user_id = _uid FOR UPDATE;
    IF COALESCE(bal,0) < cost THEN
      PERFORM set_config('app.economy_override', 'off', true);
      INSERT INTO public.audit_events (kind, action, actor_user_id, actor_name, source, detail)
      VALUES ('shop','purchase_rejected',_uid,uname,'db',
              jsonb_build_object('item',_key,'price',cost,'balance',COALESCE(bal,0),'reason','not_enough_coins'));
      RAISE EXCEPTION 'not enough coins';
    END IF;
    UPDATE public.user_wallets SET coins = coins - cost, updated_at = now() WHERE user_id = _uid;
  END IF;

  INSERT INTO public.user_unlocks (user_id, item_key) VALUES (_uid, _key);
  SELECT COALESCE(coins,0) INTO bal FROM public.user_wallets WHERE user_id = _uid;
  PERFORM set_config('app.economy_override', 'off', true);

  INSERT INTO public.audit_events (kind, action, actor_user_id, actor_name, source, detail)
  VALUES ('shop','purchase_completed',_uid,uname,'db',
          jsonb_build_object('item',_key,'price',cost,'balance_after',COALESCE(bal,0)));

  RETURN COALESCE(bal,0);
END; $$;