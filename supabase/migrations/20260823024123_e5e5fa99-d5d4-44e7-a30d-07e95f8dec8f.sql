
REVOKE EXECUTE ON FUNCTION public.grant_imagehost_badge_for_user(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_imagehost_badge_unlock() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_imagehost_badge_rank() FROM PUBLIC, anon, authenticated;
