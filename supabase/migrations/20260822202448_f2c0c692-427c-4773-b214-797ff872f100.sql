
-- Quitar del API público todas las funciones internas (triggers y utilidades)
DO $$
DECLARE fn record;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef
      AND p.proname NOT IN ('claim_mission','purchase_item','gift_rank','rotate_login_code','mission_progress','has_role','admin_grant_coins')
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', fn.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', fn.sig);
  END LOOP;
END $$;

REVOKE ALL ON FUNCTION public.new_login_code() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.new_login_code() TO service_role;

-- has_role e is_banned siguen disponibles porque los usa la propia app
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, anon;
