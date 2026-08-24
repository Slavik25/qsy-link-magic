ALTER TABLE public.ip_logs
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS lat double precision,
  ADD COLUMN IF NOT EXISTS lon double precision,
  ADD COLUMN IF NOT EXISTS isp text,
  ADD COLUMN IF NOT EXISTS timezone text,
  ADD COLUMN IF NOT EXISTS proxy boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS event text NOT NULL DEFAULT 'pageview';

CREATE INDEX IF NOT EXISTS ip_logs_ip_idx ON public.ip_logs (ip);
CREATE INDEX IF NOT EXISTS ip_logs_user_idx ON public.ip_logs (user_id);
CREATE INDEX IF NOT EXISTS ip_logs_created_idx ON public.ip_logs (created_at DESC);