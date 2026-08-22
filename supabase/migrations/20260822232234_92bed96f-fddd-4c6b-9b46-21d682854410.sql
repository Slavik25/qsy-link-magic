DROP POLICY IF EXISTS "Anyone can record a click" ON public.link_clicks;

DROP POLICY IF EXISTS "Anyone can read user assets" ON storage.objects;

REVOKE EXECUTE ON FUNCTION public.admin_grant_coins(uuid, integer) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.claim_mission(text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.gift_rank(text, text, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.mission_progress(text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.purchase_item(text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.resolve_rank_review(uuid, text, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rotate_login_code() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_site_owner(uuid) FROM anon, PUBLIC;