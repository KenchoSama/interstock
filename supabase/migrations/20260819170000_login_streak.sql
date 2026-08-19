-- Tracks daily sign-in streaks for students. last_active_date is the last
-- calendar day the student was seen; login_streak is the current run of
-- consecutive days, updated client-side once per day on login.

alter table public.profiles
  add column if not exists last_active_date date,
  add column if not exists login_streak integer not null default 0;
