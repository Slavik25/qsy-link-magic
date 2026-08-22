
CREATE TABLE IF NOT EXISTS public.global_chat_message_meta (
  message_id uuid PRIMARY KEY REFERENCES public.global_chat_messages(id) ON DELETE CASCADE,
  ip text,
  fingerprint text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.global_chat_message_meta TO service_role;
ALTER TABLE public.global_chat_message_meta ENABLE ROW LEVEL SECURITY;

INSERT INTO public.global_chat_message_meta (message_id, ip, fingerprint, created_at)
SELECT id, ip, fingerprint, created_at FROM public.global_chat_messages
ON CONFLICT (message_id) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_chat_meta_ip_created ON public.global_chat_message_meta (ip, created_at DESC);

DROP INDEX IF EXISTS public.idx_chat_ip_created;
ALTER TABLE public.global_chat_messages DROP COLUMN IF EXISTS ip;
ALTER TABLE public.global_chat_messages DROP COLUMN IF EXISTS fingerprint;

CREATE OR REPLACE FUNCTION public.chat_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE n integer;
BEGIN
  NEW.message := btrim(NEW.message);
  IF NEW.message = '' OR length(NEW.message) > 500 THEN
    RAISE EXCEPTION 'mensaje inválido';
  END IF;

  SELECT count(*) INTO n FROM public.global_chat_messages
    WHERE user_id = NEW.user_id AND created_at > now() - interval '15 seconds';
  IF n >= 5 THEN RAISE EXCEPTION 'estás enviando mensajes demasiado rápido'; END IF;

  SELECT count(*) INTO n FROM public.global_chat_messages
    WHERE user_id = NEW.user_id AND created_at > now() - interval '5 minutes';
  IF n >= 30 THEN RAISE EXCEPTION 'límite de mensajes alcanzado, espera un momento'; END IF;

  IF EXISTS (
    SELECT 1 FROM public.global_chat_messages
    WHERE user_id = NEW.user_id AND message = NEW.message
      AND created_at > now() - interval '60 seconds'
  ) THEN
    RAISE EXCEPTION 'mensaje duplicado';
  END IF;

  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.post_chat_message(
  _user_id uuid,
  _profile_id uuid,
  _author_name text,
  _author_avatar text,
  _message text,
  _ip text,
  _fingerprint text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE n integer; new_id uuid;
BEGIN
  IF _ip IS NOT NULL AND _ip <> '' THEN
    SELECT count(*) INTO n FROM public.global_chat_message_meta
      WHERE ip = _ip AND created_at > now() - interval '15 seconds';
    IF n >= 8 THEN RAISE EXCEPTION 'demasiados mensajes desde tu conexión'; END IF;

    SELECT count(*) INTO n FROM public.global_chat_message_meta
      WHERE ip = _ip AND created_at > now() - interval '5 minutes';
    IF n >= 60 THEN RAISE EXCEPTION 'límite por conexión alcanzado'; END IF;
  END IF;

  INSERT INTO public.global_chat_messages (user_id, profile_id, author_name, author_avatar, message)
  VALUES (_user_id, _profile_id, _author_name, _author_avatar, _message)
  RETURNING id INTO new_id;

  INSERT INTO public.global_chat_message_meta (message_id, ip, fingerprint)
  VALUES (new_id, nullif(_ip, ''), nullif(_fingerprint, ''));

  RETURN new_id;
END; $$;

REVOKE ALL ON FUNCTION public.post_chat_message(uuid, uuid, text, text, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.post_chat_message(uuid, uuid, text, text, text, text, text) TO service_role;

REVOKE SELECT ON public.global_chat_messages FROM anon, authenticated;
GRANT SELECT (id, user_id, profile_id, author_name, author_avatar, message, created_at)
  ON public.global_chat_messages TO anon, authenticated;
