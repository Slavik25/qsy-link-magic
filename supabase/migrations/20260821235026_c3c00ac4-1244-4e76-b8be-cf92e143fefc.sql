-- Admins can grant/revoke shop unlocks
CREATE POLICY "admins_insert_unlocks" ON public.user_unlocks
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins_delete_unlocks" ON public.user_unlocks
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins_select_unlocks" ON public.user_unlocks
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT, DELETE ON public.user_unlocks TO authenticated;

-- Admins can gift coins
CREATE OR REPLACE FUNCTION public.admin_grant_coins(_user_id uuid, _amount integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE bal integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not authorized'; END IF;
  INSERT INTO public.user_wallets (user_id, coins) VALUES (_user_id, GREATEST(0, _amount))
    ON CONFLICT (user_id) DO UPDATE SET coins = GREATEST(0, public.user_wallets.coins + _amount), updated_at = now();
  SELECT coins INTO bal FROM public.user_wallets WHERE user_id = _user_id;
  RETURN bal;
END; $$;

CREATE POLICY "admins_select_wallets" ON public.user_wallets
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));