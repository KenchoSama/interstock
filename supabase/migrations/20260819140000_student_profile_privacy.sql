-- Lets a student mark their profile private so other students can't view
-- its details (bio, LinkedIn, avatar, trades, holdings) via the directory
-- or leaderboard. Enforced in the application layer, same as other
-- student-facing flags on this table (hasAgreedToCoC, hasAssessment, etc).

alter table public.profiles
  add column if not exists is_private boolean not null default false;
