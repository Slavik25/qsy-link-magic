REVOKE EXECUTE ON FUNCTION public.new_login_code() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.ensure_login_code() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.rotate_login_code() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.rotate_login_code() TO authenticated;