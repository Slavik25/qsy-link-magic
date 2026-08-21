CREATE TABLE public.profile_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'Perfil',
  display_name text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  avatar_url text,
  banner_url text,
  theme jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_presets TO authenticated;
GRANT ALL ON public.profile_presets TO service_role;

ALTER TABLE public.profile_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own presets" ON public.profile_presets
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER profile_presets_touch BEFORE UPDATE ON public.profile_presets
FOR EACH ROW EXECUTE FUNCTION public.qsy_touch_updated_at();