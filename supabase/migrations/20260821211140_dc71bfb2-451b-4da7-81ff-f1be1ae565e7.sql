CREATE TABLE public.global_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name text NOT NULL DEFAULT 'anon',
  author_avatar text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.global_chat_messages TO authenticated;
GRANT SELECT ON public.global_chat_messages TO anon;
GRANT ALL ON public.global_chat_messages TO service_role;
ALTER TABLE public.global_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "global chat is public" ON public.global_chat_messages FOR SELECT USING (true);
CREATE POLICY "authenticated users can post" ON public.global_chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "authors delete own messages" ON public.global_chat_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins delete messages" ON public.global_chat_messages FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE INDEX global_chat_created_idx ON public.global_chat_messages (created_at DESC);
ALTER PUBLICATION supabase_realtime ADD TABLE public.global_chat_messages;