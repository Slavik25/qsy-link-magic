-- 1. Restrict OG marketplace listings (contact details) to signed-in users
DROP POLICY IF EXISTS "og_listings_public_read" ON public.og_listings;
CREATE POLICY "og_listings_authenticated_read" ON public.og_listings
  FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.og_listings FROM anon;

-- 2. Hide visitor IP/fingerprint from profile owners (column-level grants)
REVOKE SELECT ON public.profile_views FROM authenticated;
GRANT SELECT (id, profile_id, country, device, browser, referrer, created_at)
  ON public.profile_views TO authenticated;
REVOKE SELECT ON public.profile_views FROM anon;

-- 3. Lock down SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.purchase_featured(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.expire_featured() FROM anon, authenticated;
