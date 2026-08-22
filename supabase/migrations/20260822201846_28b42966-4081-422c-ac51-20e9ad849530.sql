-- Solo el servidor puede registrar visitas y mensajes de chat.
DROP POLICY IF EXISTS "Anyone can record a view" ON public.profile_views;
DROP POLICY IF EXISTS "Validated profile view inserts" ON public.profile_views;
REVOKE INSERT ON public.profile_views FROM anon, authenticated;

DROP POLICY IF EXISTS "authenticated users can post" ON public.global_chat_messages;
REVOKE INSERT ON public.global_chat_messages FROM anon, authenticated;

GRANT ALL ON public.profile_views TO service_role;
GRANT ALL ON public.global_chat_messages TO service_role;