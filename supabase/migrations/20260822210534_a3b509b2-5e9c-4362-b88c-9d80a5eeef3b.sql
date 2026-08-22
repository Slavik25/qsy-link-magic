
-- 1) Column-level lockdown: authenticated users may only update presentation fields
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (display_name, bio, location, avatar_url, banner_url, theme, music, username, username_set, domain, updated_at)
  ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- 2) Trigger guard: privileged fields can never change from a client session
CREATE OR REPLACE FUNCTION public.guard_profile_privileged_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin boolean := false;
  is_service boolean := (current_setting('request.jwt.claim.role', true) = 'service_role')
                        OR (coalesce(current_setting('request.jwt.claims', true), '') LIKE '%"role":"service_role"%')
                        OR auth.uid() IS NULL;
BEGIN
  IF auth.uid() IS NOT NULL THEN
    is_admin := public.has_role(auth.uid(), 'admin'::app_role);
  END IF;

  IF is_service OR is_admin THEN
    RETURN NEW;
  END IF;

  -- silently restore any privileged field a client tried to change
  NEW.verified   := OLD.verified;
  NEW.featured   := OLD.featured;
  NEW.rank       := OLD.rank;
  NEW.view_count := OLD.view_count;
  NEW.like_count := OLD.like_count;
  NEW.uid        := OLD.uid;
  NEW.user_id    := OLD.user_id;
  NEW.id         := OLD.id;
  NEW.created_at := OLD.created_at;

  -- premium-only domain selection
  IF NEW.domain IS DISTINCT FROM OLD.domain
     AND coalesce(OLD.rank, 'free') NOT IN ('obsidian', 'seraph') THEN
    NEW.domain := OLD.domain;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.guard_profile_privileged_fields() FROM public, anon, authenticated;

DROP TRIGGER IF EXISTS trg_guard_profile_privileged_fields ON public.profiles;
CREATE TRIGGER trg_guard_profile_privileged_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_privileged_fields();
