-- XP awarded for completing an assignment was hardcoded to 15 in the client
-- (both the displayed "+15 XP" tag and the actual amount granted on submit)
-- with no backing column, so it couldn't vary per assignment. Default of 15
-- matches the previous hardcoded behavior for any existing assignments.
alter table public.assignments
  add column if not exists xp_reward integer not null default 15;
