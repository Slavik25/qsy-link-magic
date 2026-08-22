
CREATE TABLE public.site_bans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  profile_id uuid,
  ip text,
  fingerprint text,
  reason text not null default 'console_attack',
  evidence jsonb not null default '{}'::jsonb,
  user_agent text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  lifted_at timestamptz,
  lifted_by uuid
);

CREATE INDEX site_bans_user_idx ON public.site_bans (user_id) WHERE active;
CREATE INDEX site_bans_fp_idx ON public.site_bans (fingerprint) WHERE active;
CREATE INDEX site_bans_ip_idx ON public.site_bans (ip) WHERE active;

GRANT SELECT, UPDATE ON public.site_bans TO authenticated;
GRANT ALL ON public.site_bans TO service_role;

ALTER TABLE public.site_bans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view bans" ON public.site_bans
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update bans" ON public.site_bans
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.is_banned(_user_id uuid, _fingerprint text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.site_bans
    WHERE active
      AND (
        (_user_id IS NOT NULL AND user_id = _user_id)
        OR (_fingerprint IS NOT NULL AND _fingerprint <> '' AND fingerprint = _fingerprint)
      )
  )
$$;

GRANT EXECUTE ON FUNCTION public.is_banned(uuid, text) TO anon, authenticated;
