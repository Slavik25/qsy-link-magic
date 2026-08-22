
-- 1) Dueño del sitio: solo él puede otorgar/revocar el rol de administrador
CREATE OR REPLACE FUNCTION public.is_site_owner(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _user_id = 'ae27dad1-2945-478a-a4fc-49f0ed0cce1c'::uuid
$$;

DROP POLICY IF EXISTS "admins grant roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins revoke roles" ON public.user_roles;

CREATE POLICY "owner grants roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_site_owner(auth.uid())
    OR (role <> 'admin'::app_role AND public.has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "owner revokes roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (
    public.is_site_owner(auth.uid())
    OR (role <> 'admin'::app_role AND public.has_role(auth.uid(), 'admin'::app_role))
  );

-- 2) Blindaje de contadores: nadie (ni admin vía API) puede escribir visitas/likes a mano
CREATE OR REPLACE FUNCTION public.guard_profile_columns()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF current_user IN ('anon', 'authenticated') THEN
    -- contadores solo se mueven por triggers internos o boosts
    IF coalesce(current_setting('app.counter_override', true), '') <> 'on' THEN
      NEW.view_count := OLD.view_count;
      NEW.like_count := OLD.like_count;
    END IF;
    NEW.uid := OLD.uid;
    IF NOT public.has_role(auth.uid(), 'admin') THEN
      NEW.rank := OLD.rank;
      NEW.verified := OLD.verified;
      NEW.featured := OLD.featured;
      NEW.domain := OLD.domain;
    END IF;
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.apply_boost()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.amount > 1000 OR NEW.amount < -1000 THEN
    RAISE EXCEPTION 'boost fuera de rango';
  END IF;
  PERFORM set_config('app.counter_override', 'on', true);
  IF NEW.kind = 'likes' THEN
    UPDATE public.profiles SET like_count = GREATEST(0, like_count + NEW.amount) WHERE id = NEW.profile_id;
  ELSE
    UPDATE public.profiles SET view_count = GREATEST(0, view_count + NEW.amount) WHERE id = NEW.profile_id;
  END IF;
  PERFORM set_config('app.counter_override', 'off', true);
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.sync_profile_like_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM set_config('app.counter_override', 'on', true);
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET like_count = like_count + 1 WHERE id = NEW.profile_id;
    PERFORM set_config('app.counter_override', 'off', true);
    RETURN NEW;
  ELSE
    UPDATE public.profiles SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.profile_id;
    PERFORM set_config('app.counter_override', 'off', true);
    RETURN OLD;
  END IF;
END; $$;

CREATE OR REPLACE FUNCTION public.bump_profile_view_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM set_config('app.counter_override', 'on', true);
  UPDATE public.profiles SET view_count = view_count + 1 WHERE id = NEW.profile_id;
  PERFORM set_config('app.counter_override', 'off', true);
  RETURN NEW;
END; $$;

-- 3) Likes: uno por usuario y perfil
CREATE UNIQUE INDEX IF NOT EXISTS profile_likes_unique_user
  ON public.profile_likes (profile_id, user_id) WHERE user_id IS NOT NULL;

-- 4) Baneo también por IP
CREATE OR REPLACE FUNCTION public.is_banned(_user_id uuid, _fingerprint text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.site_bans
    WHERE active
      AND (
        (_user_id IS NOT NULL AND user_id = _user_id)
        OR (_fingerprint IS NOT NULL AND _fingerprint <> '' AND fingerprint = _fingerprint)
      )
  )
$$;

CREATE OR REPLACE FUNCTION public.is_banned_ctx(_user_id uuid, _fingerprint text, _ip text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.site_bans
    WHERE active
      AND (
        (_user_id IS NOT NULL AND user_id = _user_id)
        OR (_fingerprint IS NOT NULL AND _fingerprint <> '' AND fingerprint = _fingerprint)
        OR (_ip IS NOT NULL AND _ip <> '' AND ip = _ip)
      )
  )
$$;

-- 5) Usuarios baneados no pueden escribir en su perfil ni en el muro
CREATE OR REPLACE FUNCTION public.block_banned_writes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF current_user IN ('anon','authenticated') AND auth.uid() IS NOT NULL
     AND EXISTS (SELECT 1 FROM public.site_bans WHERE active AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'cuenta suspendida';
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_block_banned_profiles ON public.profiles;
CREATE TRIGGER trg_block_banned_profiles BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.block_banned_writes();

DROP TRIGGER IF EXISTS trg_block_banned_wall ON public.wall_posts;
CREATE TRIGGER trg_block_banned_wall BEFORE INSERT ON public.wall_posts
  FOR EACH ROW EXECUTE FUNCTION public.block_banned_writes();

DROP TRIGGER IF EXISTS trg_block_banned_links ON public.links;
CREATE TRIGGER trg_block_banned_links BEFORE INSERT OR UPDATE ON public.links
  FOR EACH ROW EXECUTE FUNCTION public.block_banned_writes();
