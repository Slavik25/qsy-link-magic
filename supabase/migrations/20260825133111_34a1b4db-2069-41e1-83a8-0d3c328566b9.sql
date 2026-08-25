DROP TRIGGER IF EXISTS trg_early_supporter ON public.profiles;

CREATE OR REPLACE FUNCTION public.grant_early_supporter()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Desactivado: la insignia Early Supporter ya no se otorga automáticamente.
  RETURN NEW;
END;
$$;