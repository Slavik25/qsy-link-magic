CREATE TABLE public.wall_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_id uuid,
  author_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name text NOT NULL DEFAULT 'anon',
  author_avatar text,
  message text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.wall_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wall_posts TO authenticated;
GRANT ALL ON public.wall_posts TO service_role;

ALTER TABLE public.wall_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wall posts are public" ON public.wall_posts FOR SELECT USING (true);
CREATE POLICY "authenticated users can post" ON public.wall_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "authors delete own posts" ON public.wall_posts FOR DELETE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "profile owner deletes posts" ON public.wall_posts FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = wall_posts.profile_id AND p.user_id = auth.uid()));

CREATE INDEX wall_posts_profile_created_idx ON public.wall_posts (profile_id, created_at DESC);