CREATE TABLE public.login_codes (
  user_id uuid PRIMARY KEY,
  code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.login_codes TO authenticated;
GRANT ALL ON public.login_codes TO service_role;
ALTER TABLE public.login_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own login code select" ON public.login_codes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.new_login_code()
RETURNS text LANGUAGE plpgsql SET search_path = public AS $$
DECLARE c text;
BEGIN
  LOOP
    c := 'QSY-' ||
      upper(substr(md5(gen_random_uuid()::text), 1, 4)) || '-' ||
      upper(substr(md5(gen_random_uuid()::text), 1, 4)) || '-' ||
      upper(substr(md5(gen_random_uuid()::text), 1, 4));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.login_codes WHERE code = c);
  END LOOP;
  RETURN c;
END; $$;

CREATE OR REPLACE FUNCTION public.ensure_login_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    INSERT INTO public.login_codes (user_id, code)
    VALUES (NEW.user_id, public.new_login_code())
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_ensure_login_code
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.ensure_login_code();

CREATE OR REPLACE FUNCTION public.rotate_login_code()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); c text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  c := public.new_login_code();
  INSERT INTO public.login_codes (user_id, code) VALUES (uid, c)
  ON CONFLICT (user_id) DO UPDATE SET code = EXCLUDED.code, updated_at = now();
  RETURN c;
END; $$;

INSERT INTO public.login_codes (user_id, code)
SELECT DISTINCT ON (user_id) user_id, public.new_login_code()
FROM public.profiles WHERE user_id IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;