REVOKE ALL ON FUNCTION public.admin_grant_coins(uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_grant_coins(uuid, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_grant_coins(uuid, integer) TO authenticated;

DROP POLICY IF EXISTS "Validated link click inserts" ON public.link_clicks;
CREATE POLICY "Validated link click inserts"
ON public.link_clicks FOR INSERT TO anon, authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = link_clicks.profile_id)
  AND (
    link_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.links l
      WHERE l.id = link_clicks.link_id AND l.profile_id = link_clicks.profile_id
    )
  )
);