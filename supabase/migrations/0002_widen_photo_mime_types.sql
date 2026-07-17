-- Safari/iOS can't canvas-encode WebP, so the client falls back to JPEG
-- there. The kren-wall bucket only allowed image/webp, which silently
-- rejected every iPhone upload. Widen it to match what the client
-- actually sends.
update storage.buckets
set allowed_mime_types = array['image/webp', 'image/jpeg']
where id = 'kren-wall';
