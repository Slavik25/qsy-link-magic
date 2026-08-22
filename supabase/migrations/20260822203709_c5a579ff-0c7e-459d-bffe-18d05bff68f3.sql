-- Los visitantes sin cuenta ya no pueden leer identificadores internos de cuenta
REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (
  id, username, display_name, bio, location, avatar_url, banner_url,
  verified, theme, music, featured, created_at, updated_at,
  view_count, like_count, uid, rank, domain, username_set
) ON public.profiles TO anon;