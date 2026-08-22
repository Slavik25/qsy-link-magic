-- Chat: nadie desde el navegador puede leer IP ni huella del dispositivo
REVOKE SELECT ON public.global_chat_messages FROM anon, authenticated;
GRANT SELECT (id, user_id, profile_id, author_name, author_avatar, message, created_at)
  ON public.global_chat_messages TO anon, authenticated;

-- Visitas: sin IP ni huella para clientes
REVOKE SELECT ON public.profile_views FROM anon, authenticated;
GRANT SELECT (id, profile_id, country, device, browser, referrer, created_at)
  ON public.profile_views TO anon, authenticated;