CREATE OR REPLACE FUNCTION public.gallery_is_public_owner(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = _user_id AND lower(p.rank) IN ('obsidian', 'seraph')
  ) OR EXISTS (
    SELECT 1 FROM public.user_unlocks u
    WHERE u.user_id = _user_id AND u.item_key = 'image-host'
  );
$$;

REVOKE ALL ON FUNCTION public.gallery_is_public_owner(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.gallery_is_public_owner(uuid) TO anon, authenticated;

DROP POLICY IF EXISTS "public gallery of premium owners" ON public.gallery_images;
CREATE POLICY "public gallery of premium owners"
ON public.gallery_images
FOR SELECT
TO anon, authenticated
USING (public.gallery_is_public_owner(user_id));

GRANT SELECT ON public.gallery_images TO anon;