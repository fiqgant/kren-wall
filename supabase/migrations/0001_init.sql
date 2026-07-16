-- KREN Wall — initial schema
-- Run in the Supabase SQL Editor (or `supabase db push`).

-- ============================================================
-- 1. submissions table
-- ============================================================
create table if not exists public.submissions (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 60),
  message    text not null check (char_length(message) between 1 and 300),
  photo_url  text,
  frame      integer not null default 1 check (frame in (1, 2)),
  has_photo  boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists submissions_created_at_idx
  on public.submissions (created_at desc);

-- ============================================================
-- 2. Row Level Security
--    Anyone can read and insert (no approval flow);
--    only authenticated admins can delete. No updates ever.
-- ============================================================
alter table public.submissions enable row level security;

create policy "Public read"
  on public.submissions for select
  to anon, authenticated
  using (true);

create policy "Public insert"
  on public.submissions for insert
  to anon, authenticated
  with check (true);

create policy "Admin delete"
  on public.submissions for delete
  to authenticated
  using (true);

-- ============================================================
-- 3. Realtime
-- ============================================================
alter publication supabase_realtime add table public.submissions;
-- DELETE payloads must include the row id:
alter table public.submissions replica identity full;

-- ============================================================
-- 4. Storage bucket: kren-wall  (public read)
--    Layout: photos/YYYY/MM/DD/<uuid>.webp
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('kren-wall', 'kren-wall', true, 1048576, array['image/webp'])
on conflict (id) do nothing;

create policy "Public read kren-wall"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'kren-wall');

create policy "Public upload kren-wall"
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'kren-wall'
    and (storage.foldername(name))[1] = 'photos'
  );

create policy "Admin delete kren-wall"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'kren-wall');
