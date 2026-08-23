REVOKE EXECUTE ON FUNCTION public.gift_rank(text, text, text) FROM authenticated, anon, PUBLIC;

CREATE OR REPLACE FUNCTION public.admin_grant_coins(_user_id uuid, _amount integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE bal integer;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') OR NOT public.is_site_owner(auth.uid()) THEN
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
END; $function$;

REVOKE EXECUTE ON FUNCTION public.admin_grant_coins(uuid, integer) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_grant_coins(uuid, integer) TO authenticated;