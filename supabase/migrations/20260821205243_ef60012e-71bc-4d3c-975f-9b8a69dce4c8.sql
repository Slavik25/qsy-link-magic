-- likes en perfiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS like_count integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.profile_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.profile_likes TO authenticated;
GRANT SELECT ON public.profile_likes TO anon;
GRANT ALL ON public.profile_likes TO service_role;
ALTER TABLE public.profile_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "likes are public" ON public.profile_likes FOR SELECT USING (true);
CREATE POLICY "users like" ON public.profile_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users unlike" ON public.profile_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- auditoría
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_name text NOT NULL DEFAULT 'system',
  action text NOT NULL,
  target text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read audit" ON public.admin_audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins write audit" ON public.admin_audit_log FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));

-- sanciones (baneos y silencios)
CREATE TABLE IF NOT EXISTS public.sanctions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id uuid,
  kind text NOT NULL DEFAULT 'ban',
  reason text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sanctions TO authenticated;
GRANT ALL ON public.sanctions TO service_role;
ALTER TABLE public.sanctions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage sanctions" ON public.sanctions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- nombres vetados
CREATE TABLE IF NOT EXISTS public.banned_usernames (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  reason text NOT NULL DEFAULT '',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banned_usernames TO authenticated;
GRANT ALL ON public.banned_usernames TO service_role;
ALTER TABLE public.banned_usernames ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage banned names" ON public.banned_usernames FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- denuncias
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid,
  target_profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'other',
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users create reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reporters read own" ON public.reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id);
CREATE POLICY "admins manage reports" ON public.reports FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- rastreo de ip
CREATE TABLE IF NOT EXISTS public.ip_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id uuid,
  ip text NOT NULL,
  country text,
  user_agent text,
  path text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ip_logs TO authenticated;
GRANT ALL ON public.ip_logs TO service_role;
ALTER TABLE public.ip_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read ips" ON public.ip_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- amenazas / ataques
CREATE TABLE IF NOT EXISTS public.threats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'suspicious',
  severity text NOT NULL DEFAULT 'low',
  source_ip text,
  detail text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.threats TO authenticated;
GRANT ALL ON public.threats TO service_role;
ALTER TABLE public.threats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage threats" ON public.threats FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- estado de servicios / host
CREATE TABLE IF NOT EXISTS public.service_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'operational',
  latency_ms integer NOT NULL DEFAULT 0,
  note text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.service_status TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_status TO authenticated;
GRANT ALL ON public.service_status TO service_role;
ALTER TABLE public.service_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "status is public" ON public.service_status FOR SELECT USING (true);
CREATE POLICY "admins manage status" ON public.service_status FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.service_status (name, status, latency_ms, note) VALUES
  ('Web (qsy.rip)', 'operational', 42, 'Edge global'),
  ('API', 'operational', 68, 'Lectura y escritura'),
  ('Base de datos', 'operational', 21, 'Primaria'),
  ('Almacenamiento', 'operational', 95, 'Avatares y banners'),
  ('Autenticación', 'operational', 54, 'Sesiones y OTP'),
  ('CDN / Host', 'operational', 33, 'Assets estáticos')
ON CONFLICT (name) DO NOTHING;

-- devblog
CREATE TABLE IF NOT EXISTS public.devblog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  cover_url text,
  tag text NOT NULL DEFAULT 'update',
  published boolean NOT NULL DEFAULT false,
  author_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.devblog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.devblog_posts TO authenticated;
GRANT ALL ON public.devblog_posts TO service_role;
ALTER TABLE public.devblog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published posts are public" ON public.devblog_posts FOR SELECT USING (published = true);
CREATE POLICY "admins manage devblog" ON public.devblog_posts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER devblog_touch BEFORE UPDATE ON public.devblog_posts
  FOR EACH ROW EXECUTE FUNCTION public.qsy_touch_updated_at();

-- boosts de visitas y likes
CREATE TABLE IF NOT EXISTS public.boosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'views',
  amount integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.boosts TO authenticated;
GRANT ALL ON public.boosts TO service_role;
ALTER TABLE public.boosts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage boosts" ON public.boosts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.apply_boost()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.kind = 'likes' THEN
    UPDATE public.profiles SET like_count = GREATEST(0, like_count + NEW.amount) WHERE id = NEW.profile_id;
  ELSE
    UPDATE public.profiles SET view_count = GREATEST(0, view_count + NEW.amount) WHERE id = NEW.profile_id;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER boosts_apply AFTER INSERT ON public.boosts
  FOR EACH ROW EXECUTE FUNCTION public.apply_boost();

-- gestión de roles por admins
CREATE POLICY "admins read all roles" ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins grant roles" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins revoke roles" ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- admins pueden moderar perfiles y muros
CREATE POLICY "admins update profiles" ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete wall posts" ON public.wall_posts FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- el primer usuario registrado es administrador
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, 'admin'::app_role FROM public.profiles p
WHERE p.user_id IS NOT NULL ORDER BY p.uid ASC LIMIT 1
ON CONFLICT (user_id, role) DO NOTHING;