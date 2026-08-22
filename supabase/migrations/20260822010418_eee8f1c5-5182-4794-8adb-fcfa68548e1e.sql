CREATE TABLE IF NOT EXISTS public.rank_gifts (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null,
  recipient_user_id uuid not null,
  recipient_username text not null,
  rank text not null,
  price integer not null,
  message text not null default '',
  created_at timestamptz not null default now()
);

GRANT SELECT ON public.rank_gifts TO authenticated;
GRANT ALL ON public.rank_gifts TO service_role;
ALTER TABLE public.rank_gifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rank_gifts_own" ON public.rank_gifts;
CREATE POLICY "rank_gifts_own" ON public.rank_gifts FOR SELECT TO authenticated
USING (sender_id = auth.uid() OR recipient_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.gift_rank(_username text, _rank text, _message text DEFAULT '')
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _price integer;
  _sender uuid := auth.uid();
  _recipient uuid;
  _balance integer;
  _current text;
BEGIN
  IF _sender IS NULL THEN RAISE EXCEPTION 'No autenticado'; END IF;
  IF _rank = 'obsidian' THEN _price := 5000;
  ELSIF _rank = 'seraph' THEN _price := 12000;
  ELSE RAISE EXCEPTION 'Rango inválido';
  END IF;

  SELECT user_id, rank INTO _recipient, _current
  FROM public.profiles WHERE lower(username) = lower(_username) LIMIT 1;

  IF _recipient IS NULL THEN RAISE EXCEPTION 'Usuario no encontrado'; END IF;
  IF _recipient = _sender THEN RAISE EXCEPTION 'No puedes regalarte a ti mismo'; END IF;
  IF _current = _rank OR (_current = 'seraph' AND _rank = 'obsidian') THEN
    RAISE EXCEPTION 'El usuario ya tiene ese rango o uno superior';
  END IF;

  INSERT INTO public.user_wallets (user_id, coins) VALUES (_sender, 0)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.user_wallets SET coins = coins - _price, updated_at = now()
  WHERE user_id = _sender AND coins >= _price
  RETURNING coins INTO _balance;

  IF _balance IS NULL THEN RAISE EXCEPTION 'Coins insuficientes'; END IF;

  UPDATE public.profiles SET rank = _rank, updated_at = now() WHERE user_id = _recipient;

  INSERT INTO public.rank_gifts (sender_id, recipient_user_id, recipient_username, rank, price, message)
  VALUES (_sender, _recipient, lower(_username), _rank, _price, coalesce(_message, ''));

  RETURN _balance;
END;
$$;

REVOKE ALL ON FUNCTION public.gift_rank(text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.gift_rank(text, text, text) TO authenticated;