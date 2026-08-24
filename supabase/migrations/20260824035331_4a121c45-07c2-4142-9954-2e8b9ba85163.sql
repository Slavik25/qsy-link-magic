ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username_changed_at timestamptz;

CREATE OR REPLACE FUNCTION public.enforce_username_change_cooldown()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.username IS DISTINCT FROM OLD.username THEN
    IF auth.uid() IS NOT NULL AND NOT public.is_site_owner(auth.uid()) THEN
      IF OLD.username_changed_at IS NOT NULL AND OLD.username_changed_at > now() - interval '24 hours' THEN
        RAISE EXCEPTION 'Solo puedes cambiar tu nombre de usuario una vez cada 24 horas (proximo cambio: %)', (OLD.username_changed_at + interval '24 hours');
      END IF;
    END IF;
    NEW.username_changed_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_username_change_cooldown ON public.profiles;
CREATE TRIGGER trg_username_change_cooldown
BEFORE UPDATE OF username ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.enforce_username_change_cooldown();

REVOKE EXECUTE ON FUNCTION public.enforce_username_change_cooldown() FROM PUBLIC, anon, authenticated;