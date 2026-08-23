-- OG names marketplace: listings for 3 and 4 character usernames
CREATE TABLE public.og_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  username text NOT NULL,
  price numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  contact text,
  note text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.og_listings TO authenticated;
GRANT SELECT ON public.og_listings TO anon;
GRANT ALL ON public.og_listings TO service_role;

ALTER TABLE public.og_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "og_listings_public_read" ON public.og_listings
  FOR SELECT USING (true);

CREATE POLICY "og_listings_owner_insert" ON public.og_listings
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND p.user_id = auth.uid())
  );

CREATE POLICY "og_listings_owner_update" ON public.og_listings
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "og_listings_owner_delete" ON public.og_listings
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Only 3 or 4 character usernames may be listed, and the username must match the profile
CREATE OR REPLACE FUNCTION public.validate_og_listing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uname text;
BEGIN
  SELECT lower(p.username) INTO _uname FROM public.profiles p WHERE p.id = NEW.profile_id;
  IF _uname IS NULL THEN
    RAISE EXCEPTION 'Perfil inexistente';
  END IF;
  IF char_length(_uname) NOT IN (3, 4) THEN
    RAISE EXCEPTION 'Solo se pueden vender nombres de 3 o 4 caracteres';
  END IF;
  NEW.username := _uname;
  IF NEW.price < 0 THEN
    RAISE EXCEPTION 'Precio inválido';
  END IF;
  IF NEW.currency NOT IN ('USD', 'EUR', 'COINS') THEN
    RAISE EXCEPTION 'Moneda inválida';
  END IF;
  IF NEW.status NOT IN ('active', 'paused', 'sold') THEN
    RAISE EXCEPTION 'Estado inválido';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER og_listings_validate
BEFORE INSERT OR UPDATE ON public.og_listings
FOR EACH ROW EXECUTE FUNCTION public.validate_og_listing();

-- Auto-grant the OG badge to profiles holding a 3 or 4 character username
CREATE OR REPLACE FUNCTION public.sync_og_badge()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF char_length(NEW.username) IN (3, 4) THEN
    INSERT INTO public.profile_badges (profile_id, badge_key)
    SELECT NEW.id, 'og'
    WHERE NOT EXISTS (
      SELECT 1 FROM public.profile_badges b WHERE b.profile_id = NEW.id AND b.badge_key = 'og'
    );
  ELSE
    DELETE FROM public.profile_badges WHERE profile_id = NEW.id AND badge_key = 'og';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_sync_og_badge
AFTER INSERT OR UPDATE OF username ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_og_badge();

-- Backfill existing OG holders
INSERT INTO public.profile_badges (profile_id, badge_key)
SELECT p.id, 'og' FROM public.profiles p
WHERE char_length(p.username) IN (3, 4)
  AND NOT EXISTS (SELECT 1 FROM public.profile_badges b WHERE b.profile_id = p.id AND b.badge_key = 'og');

CREATE INDEX og_listings_status_idx ON public.og_listings (status, price);