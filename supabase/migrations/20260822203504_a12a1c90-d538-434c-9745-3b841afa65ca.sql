REVOKE EXECUTE ON FUNCTION public.likes_rate_limit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_profile_likes() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_user_roles() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_profile_counters() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_admin_actions() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.analytics_rate_limit() FROM PUBLIC, anon, authenticated;