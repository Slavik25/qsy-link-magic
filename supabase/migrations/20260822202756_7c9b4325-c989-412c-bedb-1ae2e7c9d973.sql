DO $$
DECLARE t record;
BEGIN
  FOR t IN SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
           WHERE n.nspname='public' AND c.relkind='r'
  LOOP
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t.relname);
    EXECUTE format('REVOKE TRUNCATE, TRIGGER, REFERENCES ON public.%I FROM authenticated', t.relname);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t.relname);
  END LOOP;
END $$;

GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.links TO anon;
GRANT SELECT ON public.socials TO anon;
GRANT SELECT ON public.profile_badges TO anon;
GRANT SELECT ON public.profile_likes TO anon;
GRANT SELECT ON public.wall_posts TO anon;
GRANT SELECT ON public.global_chat_messages TO anon;
GRANT SELECT ON public.devblog_posts TO anon;
GRANT SELECT ON public.service_status TO anon;
GRANT SELECT ON public.shop_items TO anon;
GRANT INSERT ON public.link_clicks TO anon;