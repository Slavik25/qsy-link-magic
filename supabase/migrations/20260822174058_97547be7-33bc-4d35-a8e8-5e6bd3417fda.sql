ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username_set boolean NOT NULL DEFAULT true;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE base text; candidate text; i int := 0; chosen text; has_username boolean;
BEGIN
  chosen := NEW.raw_user_meta_data->>'username';
  has_username := chosen IS NOT NULL AND length(trim(chosen)) > 0;
  base := lower(regexp_replace(coalesce(chosen, split_part(NEW.email, '@', 1), 'user'), '[^a-z0-9_]', '', 'g'));
  IF base = '' THEN base := 'user'; has_username := false; END IF;
  candidate := base;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = candidate) LOOP
    i := i + 1; candidate := base || i::text;
  END LOOP;
  INSERT INTO public.profiles (user_id, username, display_name, username_set)
  VALUES (NEW.id, candidate, coalesce(NEW.raw_user_meta_data->>'display_name', candidate), has_username);
  RETURN NEW;
END; $function$;