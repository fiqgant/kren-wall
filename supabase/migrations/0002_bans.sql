-- KREN Wall — bans & device tracking
-- Run after 0001_init.sql in the Supabase SQL Editor.

-- ============================================================
-- 1. Add device-tracking columns to submissions
-- ============================================================
alter table public.submissions
  add column if not exists ip          text,
  add column if not exists device_id   text,
  add column if not exists user_agent  text,
  add column if not exists screen_info jsonb;

create index if not exists submissions_ip_idx on public.submissions (ip);
create index if not exists submissions_device_id_idx on public.submissions (device_id);

-- ============================================================
-- 2. banned_devices table
-- ============================================================
create table if not exists public.banned_devices (
  id         uuid primary key default gen_random_uuid(),
  ip         text,
  device_id  text,
  reason     text not null default '',
  banned_by  text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists banned_devices_ip_idx on public.banned_devices (ip);
create index if not exists banned_devices_device_id_idx on public.banned_devices (device_id);

alter table public.banned_devices
  add constraint banned_devices_check check (ip is not null or device_id is not null);

alter table public.banned_devices enable row level security;

create policy "Admin read bans"
  on public.banned_devices for select
  to authenticated
  using (true);

create policy "Admin insert bans"
  on public.banned_devices for insert
  to authenticated
  with check (true);

create policy "Admin delete bans"
  on public.banned_devices for delete
  to authenticated
  using (true);
