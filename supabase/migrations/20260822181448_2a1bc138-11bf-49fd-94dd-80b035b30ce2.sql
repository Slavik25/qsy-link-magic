DROP TRIGGER IF EXISTS profile_views_count ON public.profile_views;

INSERT INTO public.shop_items (key, kind, price) VALUES
  ('hover-none','hover',0),
  ('hover-lift','hover',0),
  ('hover-tilt','hover',200),
  ('hover-glow','hover',250),
  ('hover-shine','hover',300),
  ('hover-zoom','hover',200),
  ('hover-rgb','hover',400),
  ('hover-jelly','hover',350),
  ('hover-scan','hover',450),
  ('hover-float','hover',300)
ON CONFLICT (key) DO UPDATE SET price = EXCLUDED.price, kind = EXCLUDED.kind;