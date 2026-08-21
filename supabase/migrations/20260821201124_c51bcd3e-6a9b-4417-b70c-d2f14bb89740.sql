ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS uid bigint;

CREATE SEQUENCE IF NOT EXISTS public.profiles_uid_seq OWNED BY public.profiles.uid;

WITH ordered AS (
  SELECT id, row_number() OVER (ORDER BY created_at ASC, id ASC) AS rn
  FROM public.profiles
)
UPDATE public.profiles p SET uid = o.rn FROM ordered o WHERE p.id = o.id AND p.uid IS NULL;

SELECT setval('public.profiles_uid_seq', COALESCE((SELECT MAX(uid) FROM public.profiles), 0) + 1, false);

ALTER TABLE public.profiles ALTER COLUMN uid SET DEFAULT nextval('public.profiles_uid_seq');
ALTER TABLE public.profiles ALTER COLUMN uid SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_uid_key ON public.profiles(uid);