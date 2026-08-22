CREATE TABLE public.payment_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL,
  kind text NOT NULL DEFAULT 'self',
  rank text NOT NULL,
  recipient_user_id uuid,
  recipient_username text NOT NULL,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'pending',
  message text NOT NULL DEFAULT '',
  provider text NOT NULL DEFAULT 'dodo',
  provider_payment_id text,
  checkout_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.payment_orders TO authenticated;
GRANT ALL ON public.payment_orders TO service_role;

ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_select_own" ON public.payment_orders
  FOR SELECT TO authenticated USING (auth.uid() = buyer_id);

CREATE POLICY "orders_insert_own" ON public.payment_orders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id AND status = 'pending');

CREATE POLICY "orders_admin_select" ON public.payment_orders
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER payment_orders_touch BEFORE UPDATE ON public.payment_orders
  FOR EACH ROW EXECUTE FUNCTION public.qsy_touch_updated_at();

CREATE INDEX payment_orders_provider_idx ON public.payment_orders (provider_payment_id);

-- allow trusted server-side rank changes (paid upgrades / gifts)
CREATE OR REPLACE FUNCTION public.enforce_profile_domain()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.rank NOT IN ('free','obsidian','seraph') THEN
    RAISE EXCEPTION 'invalid rank';
  END IF;
  IF NEW.domain NOT IN ('qsy.rip','qsy.es','qsy.bio') THEN
    RAISE EXCEPTION 'invalid domain';
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.rank IS DISTINCT FROM OLD.rank
     AND NOT public.has_role(auth.uid(), 'admin')
     AND coalesce(current_setting('app.rank_override', true), '') <> 'on' THEN
    NEW.rank := OLD.rank;
  END IF;
  IF TG_OP = 'INSERT' AND NEW.rank <> 'free' AND NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.rank := 'free';
  END IF;
  IF NEW.rank <> 'seraph' THEN
    NEW.domain := 'qsy.rip';
  END IF;
  RETURN NEW;
END; $function$;

CREATE OR REPLACE FUNCTION public.complete_payment_order(_order_id uuid, _payment_id text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE o public.payment_orders;
BEGIN
  SELECT * INTO o FROM public.payment_orders WHERE id = _order_id FOR UPDATE;
  IF o.id IS NULL THEN RAISE EXCEPTION 'order not found'; END IF;
  IF o.status = 'paid' THEN RETURN 'already_paid'; END IF;

  PERFORM set_config('app.rank_override', 'on', true);
  UPDATE public.profiles SET rank = o.rank, updated_at = now()
    WHERE user_id = o.recipient_user_id;
  PERFORM set_config('app.rank_override', 'off', true);

  UPDATE public.payment_orders
     SET status = 'paid', provider_payment_id = coalesce(_payment_id, provider_payment_id)
   WHERE id = o.id;

  IF o.kind = 'gift' THEN
    INSERT INTO public.rank_gifts (sender_id, recipient_user_id, recipient_username, rank, price, message)
    VALUES (o.buyer_id, o.recipient_user_id, o.recipient_username, o.rank, o.amount_cents, o.message);
  END IF;

  RETURN 'paid';
END; $function$;

REVOKE ALL ON FUNCTION public.complete_payment_order(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_payment_order(uuid, text) TO service_role;