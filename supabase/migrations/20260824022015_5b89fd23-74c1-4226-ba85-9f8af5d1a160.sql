ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS featured_until timestamptz;

INSERT INTO public.shop_price_reference (key, price) VALUES ('featured-24h', 1500)
ON CONFLICT (key) DO UPDATE SET price = EXCLUDED.price, updated_at = now();

CREATE OR REPLACE FUNCTION public.guard_profile_privileged_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin boolean := false;
  is_service boolean := (current_setting('request.jwt.claim.role', true) = 'service_role')
                        OR (coalesce(current_setting('request.jwt.claims', true), '') LIKE '%"role":"service_role"%')
                        OR auth.uid() IS NULL;
  featured_grant boolean := coalesce(current_setting('app.featured_grant', true), '') = 'on';
BEGIN
  IF auth.uid() IS NOT NULL THEN
    is_admin := public.has_role(auth.uid(), 'admin'::app_role);
  END IF;

  IF is_service OR is_admin OR featured_grant THEN
    RETURN NEW;
  END IF;

  NEW.verified   := OLD.verified;
  NEW.featured   := OLD.featured;
  NEW.rank       := OLD.rank;
  NEW.view_count := OLD.view_count;
  NEW.like_count := OLD.like_count;
  NEW.uid        := OLD.uid;
  NEW.user_id    := OLD.user_id;
  NEW.id         := OLD.id;
  NEW.created_at := OLD.created_at;

  IF NEW.domain IS DISTINCT FROM OLD.domain
     AND coalesce(OLD.rank, 'free') NOT IN ('obsidian', 'seraph') THEN
    NEW.domain := OLD.domain;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.expire_featured()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('app.featured_grant', 'on', true);
  UPDATE public.profiles
     SET featured = false, featured_until = NULL
   WHERE featured = true AND featured_until IS NOT NULL AND featured_until <= now();
  PERFORM set_config('app.featured_grant', 'off', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.purchase_featured(_profile_id uuid)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  cost integer;
  bal integer;
  uname text;
  base timestamptz;
  new_until timestamptz;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;

  SELECT username, greatest(coalesce(featured_until, now()), now())
    INTO uname, base
    FROM public.profiles
   WHERE id = _profile_id AND user_id = _uid;

  IF uname IS NULL THEN RAISE EXCEPTION 'profile not found'; END IF;

  SELECT price INTO cost FROM public.shop_price_reference WHERE key = 'featured-24h';
  IF cost IS NULL THEN RAISE EXCEPTION 'unknown item'; END IF;

  PERFORM set_config('app.economy_override', 'on', true);

  SELECT COALESCE(coins,0) INTO bal FROM public.user_wallets WHERE user_id = _uid FOR UPDATE;
  IF COALESCE(bal,0) < cost THEN
    PERFORM set_config('app.economy_override', 'off', true);
    INSERT INTO public.audit_events (kind, action, actor_user_id, actor_name, source, detail)
    VALUES ('shop','purchase_rejected',_uid,uname,'db',
            jsonb_build_object('item','featured-24h','price',cost,'balance',COALESCE(bal,0),'reason','not_enough_coins'));
    RAISE EXCEPTION 'not enough coins';
  END IF;

  UPDATE public.user_wallets SET coins = coins - cost, updated_at = now() WHERE user_id = _uid;
  PERFORM set_config('app.economy_override', 'off', true);

  new_until := base + interval '24 hours';

  PERFORM set_config('app.featured_grant', 'on', true);
  UPDATE public.profiles
     SET featured = true, featured_until = new_until
   WHERE id = _profile_id;
  PERFORM set_config('app.featured_grant', 'off', true);

  INSERT INTO public.audit_events (kind, action, actor_user_id, actor_name, source, detail)
  VALUES ('shop','purchase_completed',_uid,uname,'db',
          jsonb_build_object('item','featured-24h','price',cost,'profile_id',_profile_id,'until',new_until));

  RETURN new_until;
END;
$$;

REVOKE ALL ON FUNCTION public.purchase_featured(uuid) FROM public;
REVOKE ALL ON FUNCTION public.expire_featured() FROM public;
GRANT EXECUTE ON FUNCTION public.purchase_featured(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.expire_featured() TO authenticated, anon;