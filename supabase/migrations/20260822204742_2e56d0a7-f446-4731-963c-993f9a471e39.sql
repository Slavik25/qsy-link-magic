ALTER TABLE public.shop_items DROP CONSTRAINT IF EXISTS shop_items_price_non_negative;
ALTER TABLE public.shop_items ADD CONSTRAINT shop_items_price_non_negative CHECK (price >= 0);

CREATE OR REPLACE FUNCTION public.enforce_reference_price()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE official integer;
BEGIN
  SELECT price INTO official FROM public.shop_price_reference WHERE key = NEW.key;
  IF official IS NOT NULL AND NEW.price IS DISTINCT FROM official THEN
    INSERT INTO public.audit_events (kind, action, actor_user_id, actor_name, source, detail)
    VALUES ('shop','price_tamper_corrected', auth.uid(),
            COALESCE((SELECT username FROM public.profiles WHERE user_id = auth.uid() LIMIT 1), current_user),
            'db', jsonb_build_object('item', NEW.key, 'attempted', NEW.price, 'official', official));
    NEW.price := official;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_enforce_reference_price ON public.shop_items;
CREATE TRIGGER trg_enforce_reference_price
BEFORE INSERT OR UPDATE ON public.shop_items
FOR EACH ROW EXECUTE FUNCTION public.enforce_reference_price();

CREATE OR REPLACE FUNCTION public.reconcile_shop()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE fixed_prices integer := 0; voided integer := 0; orphan_unlocks integer := 0; neg_wallets integer := 0; res jsonb;
BEGIN
  PERFORM set_config('app.shop_repair', 'on', true);
  UPDATE public.shop_items s SET price = r.price
    FROM public.shop_price_reference r
   WHERE r.key = s.key AND s.price IS DISTINCT FROM r.price;
  GET DIAGNOSTICS fixed_prices = ROW_COUNT;
  PERFORM set_config('app.shop_repair', 'off', true);

  UPDATE public.payment_orders SET status = 'void'
   WHERE status NOT IN ('paid','void') AND amount_cents <= 0;
  GET DIAGNOSTICS voided = ROW_COUNT;

  PERFORM set_config('app.economy_override', 'on', true);
  DELETE FROM public.user_unlocks u
   WHERE NOT EXISTS (SELECT 1 FROM public.shop_price_reference r WHERE r.key = u.item_key);
  GET DIAGNOSTICS orphan_unlocks = ROW_COUNT;

  UPDATE public.user_wallets SET coins = 0, updated_at = now() WHERE coins < 0;
  GET DIAGNOSTICS neg_wallets = ROW_COUNT;
  PERFORM set_config('app.economy_override', 'off', true);

  res := jsonb_build_object('prices_fixed', fixed_prices, 'orders_voided', voided,
                            'orphan_unlocks_removed', orphan_unlocks, 'negative_wallets_reset', neg_wallets);

  INSERT INTO public.audit_events (kind, action, actor_name, source, detail)
  VALUES ('shop',
          CASE WHEN fixed_prices + voided + orphan_unlocks + neg_wallets > 0
               THEN 'reconciliation_fixed' ELSE 'reconciliation_ok' END,
          'system', 'cron', res);

  RETURN res;
END; $$;

REVOKE EXECUTE ON FUNCTION public.reconcile_shop() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_reference_price() FROM anon, authenticated;

CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.unschedule(jobname) FROM cron.job WHERE jobname = 'qsy-shop-reconcile';
SELECT cron.schedule('qsy-shop-reconcile', '*/15 * * * *', $$SELECT public.reconcile_shop();$$);