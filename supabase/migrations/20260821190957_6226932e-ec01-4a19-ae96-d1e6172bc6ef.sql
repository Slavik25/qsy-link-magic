CREATE POLICY "Users manage own asset folder"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'user-assets' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'user-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can read user assets"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'user-assets');