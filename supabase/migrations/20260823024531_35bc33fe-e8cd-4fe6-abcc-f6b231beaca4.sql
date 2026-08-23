ALTER TABLE public.gallery_images
  ADD COLUMN IF NOT EXISTS album text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}'::text[];

CREATE INDEX IF NOT EXISTS gallery_images_user_album_idx ON public.gallery_images (user_id, album);
CREATE INDEX IF NOT EXISTS gallery_images_tags_idx ON public.gallery_images USING gin (tags);