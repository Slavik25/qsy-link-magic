CREATE TABLE public.user_streaks (
  user_id uuid PRIMARY KEY,
  current_days integer NOT NULL DEFAULT 0,
  best_days integer NOT NULL DEFAULT 0,
  total_claims integer NOT NULL DEFAULT 0,
  last_claim_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.user_streaks TO anon;
GRANT SELECT ON public.user_streaks TO authenticated;
GRANT ALL ON public.user_streaks TO service_role;

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Streaks are public read" ON public.user_streaks FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.claim_daily_reward()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _today date := (now() AT TIME ZONE 'UTC')::date;
  _row public.user_streaks%ROWTYPE;
  _streak integer;
  _reward integer;
  _bonus integer := 0;
  _bal integer;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;

  SELECT * INTO _row FROM public.user_streaks WHERE user_id = _uid FOR UPDATE;

  IF _row.user_id IS NOT NULL AND _row.last_claim_date = _today THEN
    RAISE EXCEPTION 'already claimed today';
  END IF;

  IF _row.user_id IS NULL OR _row.last_claim_date IS NULL OR _row.last_claim_date < _today - 1 THEN
    _streak := 1;
  ELSE
    _streak := _row.current_days + 1;
  END IF;

  _reward := LEAST(25 + (_streak - 1) * 10, 150);
  IF _streak % 7 = 0 THEN _bonus := 200; END IF;
  _reward := _reward + _bonus;

  INSERT INTO public.user_streaks (user_id, current_days, best_days, total_claims, last_claim_date, updated_at)
  VALUES (_uid, _streak, _streak, 1, _today, now())
  ON CONFLICT (user_id) DO UPDATE
    SET current_days = _streak,
        best_days = GREATEST(public.user_streaks.best_days, _streak),
        total_claims = public.user_streaks.total_claims + 1,
        last_claim_date = _today,
        updated_at = now();

  PERFORM set_config('app.economy_override', 'on', true);
  INSERT INTO public.user_wallets (user_id, coins) VALUES (_uid, _reward)
    ON CONFLICT (user_id) DO UPDATE SET coins = public.user_wallets.coins + _reward, updated_at = now();
  SELECT coins INTO _bal FROM public.user_wallets WHERE user_id = _uid;
  PERFORM set_config('app.economy_override', 'off', true);

  INSERT INTO public.audit_events (kind, action, actor_user_id, actor_name, source, detail)
  VALUES ('shop','daily_reward_claimed',_uid,
          COALESCE((SELECT username FROM public.profiles WHERE user_id = _uid LIMIT 1),'user'),
          'db', jsonb_build_object('streak',_streak,'reward',_reward,'bonus',_bonus,'balance_after',_bal));

  RETURN jsonb_build_object('streak',_streak,'reward',_reward,'bonus',_bonus,'balance',_bal);
END;
$$;

REVOKE ALL ON FUNCTION public.claim_daily_reward() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_daily_reward() TO authenticated;

INSERT INTO public.shop_price_reference (key, price) VALUES
  ('layout-mono', 0),
  ('layout-bubble', 200),
  ('layout-magazine', 350),
  ('layout-neonoir', 300),
  ('layout-frost', 250),
  ('layout-solar', 450),
  ('name-emboss', 0),
  ('name-lavender', 150),
  ('name-bounce', 150),
  ('name-sunset', 200),
  ('name-pixel', 200),
  ('name-matrix', 250),
  ('name-static', 250),
  ('name-plasma', 300),
  ('name-blood', 350),
  ('name-oil', 450),
  ('bg-stardust', 0),
  ('bg-orbs', 200),
  ('bg-ripple', 200),
  ('bg-waves', 250),
  ('bg-meteors', 300),
  ('bg-circuit', 350),
  ('bg-glitch', 400),
  ('bg-caustics', 450),
  ('hover-pulse', 0),
  ('hover-blurin', 150),
  ('hover-slide', 200),
  ('hover-swing', 200),
  ('hover-invert', 250),
  ('hover-depth', 300),
  ('hover-ripple', 350),
  ('hover-neonborder', 400)
ON CONFLICT (key) DO UPDATE SET price = EXCLUDED.price, updated_at = now();

INSERT INTO public.shop_items (key, kind, price)
SELECT r.key,
       CASE
         WHEN r.key LIKE 'layout-%' THEN 'layout'
         WHEN r.key LIKE 'name-%' THEN 'name'
         WHEN r.key LIKE 'bg-%' THEN 'bg'
         ELSE 'hover'
       END,
       r.price
FROM public.shop_price_reference r
WHERE r.key IN ('layout-mono','layout-bubble','layout-magazine','layout-neonoir','layout-frost','layout-solar',
  'name-emboss','name-lavender','name-bounce','name-sunset','name-pixel','name-matrix','name-static','name-plasma','name-blood','name-oil',
  'bg-stardust','bg-orbs','bg-ripple','bg-waves','bg-meteors','bg-circuit','bg-glitch','bg-caustics',
  'hover-pulse','hover-blurin','hover-slide','hover-swing','hover-invert','hover-depth','hover-ripple','hover-neonborder')
ON CONFLICT (key) DO UPDATE SET price = EXCLUDED.price;