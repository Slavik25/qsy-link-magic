CREATE TABLE IF NOT EXISTS public.rank_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  username text NOT NULL,
  rank text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reason text NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS rank_reviews_pending_unique
  ON public.rank_reviews (profile_id) WHERE status = 'pending';

GRANT SELECT, INSERT ON public.rank_reviews TO authenticated;
GRANT ALL ON public.rank_reviews TO service_role;

ALTER TABLE public.rank_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins read rank reviews" ON public.rank_reviews;
CREATE POLICY "admins read rank reviews" ON public.rank_reviews
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins open rank reviews" ON public.rank_reviews;
CREATE POLICY "admins open rank reviews" ON public.rank_reviews
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.resolve_rank_review(_review_id uuid, _decision text, _note text DEFAULT '')
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE r public.rank_reviews; admin_name text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    INSERT INTO public.audit_events (kind, action, actor_user_id, actor_name, source, detail)
    VALUES ('role','rank_review_blocked', auth.uid(),
            COALESCE((SELECT username FROM public.profiles WHERE user_id = auth.uid() LIMIT 1),'anon'),
            'db', jsonb_build_object('review', _review_id, 'decision', _decision));
    RAISE EXCEPTION 'not authorized';
  END IF;
  IF _decision NOT IN ('legit_gift','manual_adjust') THEN
    RAISE EXCEPTION 'invalid decision';
  END IF;

  SELECT * INTO r FROM public.rank_reviews WHERE id = _review_id FOR UPDATE;
  IF r.id IS NULL THEN RAISE EXCEPTION 'review not found'; END IF;
  IF r.status <> 'pending' THEN RETURN r.status; END IF;

  admin_name := COALESCE((SELECT username FROM public.profiles WHERE user_id = auth.uid() LIMIT 1),'admin');

  IF _decision = 'manual_adjust' THEN
    PERFORM set_config('app.rank_override', 'on', true);
    UPDATE public.profiles SET rank = 'free', domain = 'qsy.rip', updated_at = now() WHERE id = r.profile_id;
    PERFORM set_config('app.rank_override', 'off', true);
  END IF;

  UPDATE public.rank_reviews
     SET status = _decision, note = COALESCE(_note,''), resolved_by = auth.uid(), resolved_at = now()
   WHERE id = r.id;

  INSERT INTO public.audit_events (kind, action, actor_user_id, actor_name, profile_id, target_id, source, detail)
  VALUES ('role',
          CASE WHEN _decision = 'legit_gift' THEN 'rank_review_kept' ELSE 'rank_review_revoked' END,
          auth.uid(), admin_name, r.profile_id, r.id, 'admin_panel',
          jsonb_build_object('username', r.username, 'rank_before', r.rank,
                             'decision', _decision, 'note', COALESCE(_note,'')));

  INSERT INTO public.admin_audit_log (actor_id, actor_name, action, target, meta)
  VALUES (auth.uid(), admin_name, 'rank_review:' || _decision, r.username,
          jsonb_build_object('rank_before', r.rank, 'note', COALESCE(_note,'')));

  RETURN _decision;
END; $$;

REVOKE ALL ON FUNCTION public.resolve_rank_review(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.resolve_rank_review(uuid, text, text) TO authenticated;