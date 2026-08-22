
REVOKE INSERT, UPDATE ON public.global_chat_messages FROM anon, authenticated;
DROP POLICY IF EXISTS "no chat updates" ON public.global_chat_messages;
CREATE POLICY "no chat updates" ON public.global_chat_messages
  AS RESTRICTIVE FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "wall posts insert own profile" ON public.wall_posts;
CREATE POLICY "wall posts insert own profile" ON public.wall_posts
  AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (
    author_profile_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = author_profile_id AND p.user_id = auth.uid()
    )
  );
