
REVOKE EXECUTE ON FUNCTION public.guard_shop_items() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_economy_writes() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_reference_price() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reconcile_shop() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM public, anon;
