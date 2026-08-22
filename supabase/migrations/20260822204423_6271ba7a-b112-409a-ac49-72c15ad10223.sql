-- 1) Reference price table (authoritative, no client access)
CREATE TABLE IF NOT EXISTS public.shop_price_reference (
  key text PRIMARY KEY,
  price integer NOT NULL CHECK (price >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.shop_price_reference TO service_role;
ALTER TABLE public.shop_price_reference ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shop_price_reference_no_client" ON public.shop_price_reference FOR SELECT TO authenticated USING (false);

INSERT INTO public.shop_price_reference (key, price)
SELECT key, price FROM public.shop_items
ON CONFLICT (key) DO UPDATE SET price = EXCLUDED.price, updated_at = now();

-- 2) Audit + hard guard on any write attempt to shop_items
CREATE OR REPLACE FUNCTION public.guard_shop_items()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE allowed boolean;
BEGIN
  allowed := current_user IN ('service_role','postgres','supabase_admin')
             OR public.has_role(auth.uid(), 'admin');

  INSERT INTO public.audit_events (kind, action, actor_user_id, actor_name, source, detail)
  VALUES (
    'shop',
    CASE WHEN allowed THEN 'shop_item_' || lower(TG_OP) ELSE 'shop_item_' || lower(TG_OP) || '_blocked' END,
    auth.uid(),
    COALESCE((SELECT username FROM public.profiles WHERE user_id = auth.uid() LIMIT 1), current_user),
    'db',
    jsonb_build_object(
      'op', TG_OP,
      'db_role', current_user,
      'allowed', allowed,
      'key', COALESCE(NEW.key, OLD.key),
      'price_before', OLD.price,
      'price_after', NEW.price,
      'kind_before', OLD.kind,
      'kind_after', NEW.kind
    )
  );

  IF NOT allowed THEN
    RAISE EXCEPTION 'shop items are read-only';
  END IF;

  RETURN COALESCE(NEW, OLD);
END; $$;

DROP TRIGGER IF EXISTS trg_guard_shop_items ON public.shop_items;
CREATE TRIGGER trg_guard_shop_items
BEFORE INSERT OR UPDATE OR DELETE ON public.shop_items
FOR EACH ROW EXECUTE FUNCTION public.guard_shop_items();

-- 3) Guard direct writes to unlocks/wallets (only definer functions may write)
CREATE OR REPLACE FUNCTION public.guard_economy_writes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE allowed boolean;
BEGIN
  allowed := COALESCE(current_setting('app.economy_override', true), '') = 'on'
             OR current_user IN ('service_role','postgres','supabase_admin');
  IF NOT allowed THEN
    INSERT INTO public.audit_events (kind, action, actor_user_id, actor_name, source, detail)
    VALUES ('shop', 'economy_write_blocked', auth.uid(),
            COALESCE((SELECT username FROM public.profiles WHERE user_id = auth.uid() LIMIT 1), current_user),
            'db',
            jsonb_build_object('table', TG_TABLE_NAME, 'op', TG_OP, 'db_role', current_user));
    RAISE EXCEPTION 'economy writes must go through the store';
  END IF;
  RETURN COALESCE(NEW, OLD);
END; $$;

DROP TRIGGER IF EXISTS trg_guard_user_unlocks ON public.user_unlocks;
CREATE TRIGGER trg_guard_user_unlocks
BEFORE INSERT OR UPDATE OR DELETE ON public.user_unlocks
FOR EACH ROW EXECUTE FUNCTION public.guard_economy_writes();

DROP TRIGGER IF EXISTS trg_guard_user_wallets ON public.user_wallets;
CREATE TRIGGER trg_guard_user_wallets
BEFORE INSERT OR UPDATE OR DELETE ON public.user_wallets
FOR EACH ROW EXECUTE FUNCTION public.guard_economy_writes();

-- 4) Server-enforced pricing on purchase
CREATE OR REPLACE FUNCTION public.purchase_item(_key text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE uid uuid := auth.uid(); cost integer; listed integer; bal integer; uname text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  uname := COALESCE((SELECT username FROM public.profiles WHERE user_id = uid LIMIT 1), 'user');

  SELECT price INTO listed FROM public.shop_items WHERE key = _key;
  SELECT price INTO cost FROM public.shop_price_reference WHERE key = _key;

  IF cost IS NULL THEN
    INSERT INTO public.audit_events (kind, action, actor_user_id, actor_name, source, detail)
    VALUES ('shop','purchase_rejected',uid,uname,'db',jsonb_build_object('item',_key,'reason','unknown_item'));
    RAISE EXCEPTION 'unknown item';
  END IF;

  IF listed IS DISTINCT FROM cost THEN
    INSERT INTO public.audit_events (kind, action, actor_user_id, actor_name, source, detail)
    VALUES ('shop','price_mismatch_detected',uid,uname,'db',
            jsonb_build_object('item',_key,'listed',listed,'official',cost));
    PERFORM set_config('app.shop_repair', 'on', true);
    UPDATE public.shop_items SET price = cost WHERE key = _key;
  END IF;

  IF EXISTS (SELECT 1 FROM public.user_unlocks WHERE user_id = uid AND item_key = _key) THEN
    SELECT COALESCE(coins,0) INTO bal FROM public.user_wallets WHERE user_id = uid;
    RETURN COALESCE(bal,0);
  END IF;

  PERFORM set_config('app.economy_override', 'on', true);

  IF cost > 0 THEN
    SELECT COALESCE(coins,0) INTO bal FROM public.user_wallets WHERE user_id = uid FOR UPDATE;
    IF COALESCE(bal,0) < cost THEN
      PERFORM set_config('app.economy_override', 'off', true);
      INSERT INTO public.audit_events (kind, action, actor_user_id, actor_name, source, detail)
      VALUES ('shop','purchase_rejected',uid,uname,'db',
              jsonb_build_object('item',_key,'price',cost,'balance',COALESCE(bal,0),'reason','not_enough_coins'));
      RAISE EXCEPTION 'not enough coins';
    END IF;
    UPDATE public.user_wallets SET coins = coins - cost, updated_at = now() WHERE user_id = uid;
  END IF;

  INSERT INTO public.user_unlocks (user_id, item_key) VALUES (uid, _key);
  SELECT COALESCE(coins,0) INTO bal FROM public.user_wallets WHERE user_id = uid;
  PERFORM set_config('app.economy_override', 'off', true);

  INSERT INTO public.audit_events (kind, action, actor_user_id, actor_name, source, detail)
  VALUES ('shop','purchase_completed',uid,uname,'db',
          jsonb_build_object('item',_key,'price',cost,'balance_after',COALESCE(bal,0)));

  RETURN COALESCE(bal,0);
END; $$;

-- allow the definer repair update above (admin bypass already handled)
CREATE OR REPLACE FUNCTION public.guard_shop_items()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE allowed boolean;
BEGIN
  allowed := current_user IN ('service_role','postgres','supabase_admin')
             OR COALESCE(current_setting('app.shop_repair', true), '') = 'on'
             OR public.has_role(auth.uid(), 'admin');

  INSERT INTO public.audit_events (kind, action, actor_user_id, actor_name, source, detail)
  VALUES (
    'shop',
    CASE WHEN allowed THEN 'shop_item_' || lower(TG_OP) ELSE 'shop_item_' || lower(TG_OP) || '_blocked' END,
    auth.uid(),
    COALESCE((SELECT username FROM public.profiles WHERE user_id = auth.uid() LIMIT 1), current_user),
    'db',
    jsonb_build_object('op', TG_OP, 'db_role', current_user, 'allowed', allowed,
      'key', COALESCE(NEW.key, OLD.key), 'price_before', OLD.price, 'price_after', NEW.price)
  );

  IF NOT allowed THEN
    RAISE EXCEPTION 'shop items are read-only';
  END IF;
  RETURN COALESCE(NEW, OLD);
END; $$;

-- 5) Claim mission also must bypass wallet guard
CREATE OR REPLACE FUNCTION public.claim_mission(_key text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE uid uuid := auth.uid(); goal integer; reward integer; prog integer; bal integer;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
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
  IF EXISTS (SELECT 1 FROM public.mission_claims WHERE user_id = uid AND mission_key = _key) THEN
    RAISE EXCEPTION 'already claimed';
  END IF;
  INSERT INTO public.mission_claims (user_id, mission_key, reward) VALUES (uid, _key, reward);
  PERFORM set_config('app.economy_override', 'on', true);
  INSERT INTO public.user_wallets (user_id, coins) VALUES (uid, reward)
    ON CONFLICT (user_id) DO UPDATE SET coins = public.user_wallets.coins + reward, updated_at = now();
  SELECT coins INTO bal FROM public.user_wallets WHERE user_id = uid;
  PERFORM set_config('app.economy_override', 'off', true);
  INSERT INTO public.audit_events (kind, action, actor_user_id, actor_name, source, detail)
  VALUES ('shop','mission_claimed',uid,
          COALESCE((SELECT username FROM public.profiles WHERE user_id = uid LIMIT 1),'user'),
          'db', jsonb_build_object('mission',_key,'reward',reward,'balance_after',bal));
  RETURN bal;
END; $$;

-- 6) Admin coin grants must bypass wallet guard too
CREATE OR REPLACE FUNCTION public.admin_grant_coins(_user_id uuid, _amount integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE bal integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    INSERT INTO public.audit_events (kind, action, actor_user_id, actor_name, source, detail)
    VALUES ('shop','coin_grant_blocked',auth.uid(),
            COALESCE((SELECT username FROM public.profiles WHERE user_id = auth.uid() LIMIT 1),'anon'),
            'db', jsonb_build_object('target',_user_id,'amount',_amount));
    RAISE EXCEPTION 'not authorized';
  END IF;
  PERFORM set_config('app.economy_override', 'on', true);
  INSERT INTO public.user_wallets (user_id, coins) VALUES (_user_id, GREATEST(0, _amount))
    ON CONFLICT (user_id) DO UPDATE SET coins = GREATEST(0, public.user_wallets.coins + _amount), updated_at = now();
  SELECT coins INTO bal FROM public.user_wallets WHERE user_id = _user_id;
  PERFORM set_config('app.economy_override', 'off', true);
  INSERT INTO public.audit_events (kind, action, actor_user_id, actor_name, target_id, source, detail)
  VALUES ('shop','coin_grant',auth.uid(),
          COALESCE((SELECT username FROM public.profiles WHERE user_id = auth.uid() LIMIT 1),'admin'),
          _user_id,'db', jsonb_build_object('amount',_amount,'balance_after',bal));
  RETURN bal;
END; $$;

REVOKE EXECUTE ON FUNCTION public.guard_shop_items() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_economy_writes() FROM anon, authenticated;