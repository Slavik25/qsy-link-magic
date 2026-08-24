CREATE TABLE public.streak_claims (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  claim_date date NOT NULL,
  streak integer NOT NULL,
  reward integer NOT NULL,
  bonus integer NOT NULL DEFAULT 0,
  milestone_days integer,
  milestone_reward integer NOT NULL DEFAULT 0,
  milestone_item text,
  balance_after integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, claim_date)
);

GRANT SELECT ON public.streak_claims TO authenticated;
GRANT ALL ON public.streak_claims TO service_role;
ALTER TABLE public.streak_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own streak claims" ON public.streak_claims
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.streak_milestones (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  days integer NOT NULL,
  reward integer NOT NULL DEFAULT 0,
  item_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, days)
);

GRANT SELECT ON public.streak_milestones TO authenticated;
GRANT ALL ON public.streak_milestones TO service_role;
ALTER TABLE public.streak_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own streak milestones" ON public.streak_milestones
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_streak_claims_user_date ON public.streak_claims (user_id, claim_date DESC);

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
  _ms_days integer := NULL;
  _ms_reward integer := 0;
  _ms_item text := NULL;
  _bal integer;
  _inserted boolean;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;

  -- Serializa reclamos concurrentes del mismo usuario (varias pestañas a la vez).
  PERFORM pg_advisory_xact_lock(hashtextextended(_uid::text, 42));

  SELECT * INTO _row FROM public.user_streaks WHERE user_id = _uid FOR UPDATE;

  IF EXISTS (SELECT 1 FROM public.streak_claims WHERE user_id = _uid AND claim_date = _today) THEN
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

  -- Hitos escalonados (una sola vez por usuario)
  IF _streak >= 90 AND NOT EXISTS (SELECT 1 FROM public.streak_milestones WHERE user_id = _uid AND days = 90) THEN
    _ms_days := 90; _ms_reward := 2000; _ms_item := 'layout-solar';
  ELSIF _streak >= 30 AND NOT EXISTS (SELECT 1 FROM public.streak_milestones WHERE user_id = _uid AND days = 30) THEN
    _ms_days := 30; _ms_reward := 750; _ms_item := 'bg-glitch';
  ELSIF _streak >= 7 AND NOT EXISTS (SELECT 1 FROM public.streak_milestones WHERE user_id = _uid AND days = 7) THEN
    _ms_days := 7; _ms_reward := 250; _ms_item := 'name-lavender';
  END IF;

  -- Guardia dura: el índice único impide un segundo reclamo el mismo día.
  INSERT INTO public.streak_claims (user_id, claim_date, streak, reward, bonus, milestone_days, milestone_reward, milestone_item)
  VALUES (_uid, _today, _streak, _reward + _ms_reward, _bonus, _ms_days, _ms_reward, _ms_item)
  ON CONFLICT (user_id, claim_date) DO NOTHING;

  GET DIAGNOSTICS _inserted = ROW_COUNT;
  IF NOT _inserted THEN RAISE EXCEPTION 'already claimed today'; END IF;

  INSERT INTO public.user_streaks (user_id, current_days, best_days, total_claims, last_claim_date, updated_at)
  VALUES (_uid, _streak, _streak, 1, _today, now())
  ON CONFLICT (user_id) DO UPDATE
    SET current_days = _streak,
        best_days = GREATEST(public.user_streaks.best_days, _streak),
        total_claims = public.user_streaks.total_claims + 1,
        last_claim_date = _today,
        updated_at = now();

  PERFORM set_config('app.economy_override', 'on', true);

  INSERT INTO public.user_wallets (user_id, coins) VALUES (_uid, _reward + _ms_reward)
    ON CONFLICT (user_id) DO UPDATE SET coins = public.user_wallets.coins + _reward + _ms_reward, updated_at = now();

  IF _ms_days IS NOT NULL THEN
    INSERT INTO public.streak_milestones (user_id, days, reward, item_key)
    VALUES (_uid, _ms_days, _ms_reward, _ms_item)
    ON CONFLICT (user_id, days) DO NOTHING;
    IF _ms_item IS NOT NULL THEN
      INSERT INTO public.user_unlocks (user_id, item_key) VALUES (_uid, _ms_item)
      ON CONFLICT (user_id, item_key) DO NOTHING;
    END IF;
  END IF;

  SELECT coins INTO _bal FROM public.user_wallets WHERE user_id = _uid;
  PERFORM set_config('app.economy_override', 'off', true);

  UPDATE public.streak_claims SET balance_after = COALESCE(_bal, 0)
  WHERE user_id = _uid AND claim_date = _today;

  INSERT INTO public.audit_events (kind, action, actor_user_id, actor_name, source, detail)
  VALUES ('shop','daily_reward_claimed',_uid,
          COALESCE((SELECT username FROM public.profiles WHERE user_id = _uid LIMIT 1),'user'),
          'db', jsonb_build_object('streak',_streak,'reward',_reward,'bonus',_bonus,
                                   'milestone',_ms_days,'milestone_reward',_ms_reward,
                                   'milestone_item',_ms_item,'balance_after',_bal));

  RETURN jsonb_build_object('streak',_streak,'reward',_reward + _ms_reward,'bonus',_bonus,
                            'milestone',_ms_days,'milestone_item',_ms_item,
                            'milestone_reward',_ms_reward,'balance',_bal);
END;
$$;

REVOKE ALL ON FUNCTION public.claim_daily_reward() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_daily_reward() TO authenticated;