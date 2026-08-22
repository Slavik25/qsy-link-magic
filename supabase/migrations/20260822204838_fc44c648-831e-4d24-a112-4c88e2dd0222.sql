CREATE TABLE IF NOT EXISTS public.security_alert_deliveries (
  event_id uuid PRIMARY KEY,
  target text NOT NULL,
  ok boolean NOT NULL DEFAULT true,
  error text,
  delivered_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.security_alert_deliveries TO service_role;
ALTER TABLE public.security_alert_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alert_deliveries_admin_read" ON public.security_alert_deliveries
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
GRANT SELECT ON public.security_alert_deliveries TO authenticated;

INSERT INTO public.integration_settings (key, label, category, value, value_hint)
VALUES
  ('security_webhook', 'Webhook de alertas de seguridad', 'seguridad', NULL, 'URL a la que se envían las alertas de manipulación'),
  ('security_alert_email', 'Email de alertas de seguridad', 'seguridad', NULL, 'Correo que recibe las alertas de manipulación')
ON CONFLICT DO NOTHING;

CREATE EXTENSION IF NOT EXISTS pg_net;
SELECT cron.unschedule(jobname) FROM cron.job WHERE jobname = 'qsy-security-alerts';
SELECT cron.schedule(
  'qsy-security-alerts',
  '*/5 * * * *',
  $$SELECT net.http_post(
      url := 'https://qsy.rip/api/public/hooks/security-alerts',
      headers := '{"Content-Type":"application/json","apikey":"sb_publishable_0r8MD9_dXMPOXik2XqyVhA_mKhW9M12"}'::jsonb,
      body := '{"source":"cron"}'::jsonb
    );$$
);