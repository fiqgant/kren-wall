-- FRAMES now has 5 entries (see src/lib/frames.ts), but this check
-- constraint still only allowed 1 or 2 — widen to match.
alter table public.submissions drop constraint submissions_frame_check;
alter table public.submissions add constraint submissions_frame_check
  check (frame in (1, 2, 3, 4, 5));
