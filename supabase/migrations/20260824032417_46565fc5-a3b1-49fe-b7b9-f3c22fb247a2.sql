CREATE TABLE public.signup_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip text,
  kind text NOT NULL DEFAULT 'email',
  ok boolean NOT NULL DEFAULT false,
  reason text NOT NULL DEFAULT '',
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.signup_attempts TO service_role;

ALTER TABLE public.signup_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "signup_attempts_admin_read" ON public.signup_attempts
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX signup_attempts_ip_created_idx ON public.signup_attempts (ip, created_at DESC);