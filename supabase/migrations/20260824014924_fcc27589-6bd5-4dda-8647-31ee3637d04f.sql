CREATE TABLE public.community_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  author_name text NOT NULL DEFAULT '',
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  theme jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  preview_username text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  review_note text NOT NULL DEFAULT '',
  reviewed_by uuid,
  reviewed_at timestamptz,
  uses integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX community_templates_status_idx ON public.community_templates (status, created_at DESC);
CREATE INDEX community_templates_user_idx ON public.community_templates (user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_templates TO authenticated;
GRANT SELECT ON public.community_templates TO anon;
GRANT ALL ON public.community_templates TO service_role;

ALTER TABLE public.community_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "approved templates are public"
  ON public.community_templates FOR SELECT
  USING (status = 'approved');

CREATE POLICY "authors read own templates"
  ON public.community_templates FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "authors create own templates"
  ON public.community_templates FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "authors edit own pending templates"
  ON public.community_templates FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND status <> 'approved')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "authors delete own templates"
  ON public.community_templates FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins manage templates"
  ON public.community_templates FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER community_templates_updated_at
  BEFORE UPDATE ON public.community_templates
  FOR EACH ROW EXECUTE FUNCTION public.qsy_touch_updated_at();

CREATE OR REPLACE FUNCTION public.use_community_template(_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _uses integer;
BEGIN
  UPDATE public.community_templates
     SET uses = uses + 1
   WHERE id = _id AND status = 'approved'
   RETURNING uses INTO _uses;
  RETURN COALESCE(_uses, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.use_community_template(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.use_community_template(uuid) TO authenticated;