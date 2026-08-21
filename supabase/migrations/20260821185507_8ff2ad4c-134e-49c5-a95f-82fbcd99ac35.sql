DELETE FROM public.link_clicks WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id IS NULL);
DELETE FROM public.profile_views WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id IS NULL);
DELETE FROM public.links WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id IS NULL);
DELETE FROM public.socials WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id IS NULL);
DELETE FROM public.profiles WHERE user_id IS NULL;