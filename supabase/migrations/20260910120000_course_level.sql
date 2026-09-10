-- Replaces XP-derived "levels" (which never actually gated anything) with
-- an explicit course_level: 1 = beginner (today's fully-locked-trading
-- behavior -- the default, so nothing changes for existing students),
-- 2 = intermediate (unlocks regular stock trading), 3 = advanced
-- (everything unlocked). Chosen mandatorily at signup; admin can correct it
-- afterward for students who enrolled before this field existed and never
-- got to choose.

alter table public.profiles
  add column if not exists course_level smallint not null default 1
  check (course_level in (1, 2, 3));

-- "Users can update own profile" has no WITH CHECK restricting which
-- columns a student can change on their own row -- the same
-- privilege-escalation shape already fixed for `role` via
-- prevent_role_self_escalation / enforce_role_change_admin_only.
-- course_level gates which trading features unlock, so it needs the
-- identical guard: only an admin may change it after row creation.
create or replace function public.prevent_course_level_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.course_level is distinct from old.course_level
     and get_my_role() is distinct from 'admin'::user_role then
    raise exception 'Only admins can change a student''s course level';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_course_level_change_admin_only on public.profiles;
create trigger enforce_course_level_change_admin_only
  before update on public.profiles
  for each row
  execute function public.prevent_course_level_self_escalation();

-- Let a new signup set its course level atomically at row creation
-- (an INSERT, so the guard trigger above doesn't apply), alongside full_name.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, xp, full_name, course_level)
  values (
    new.id,
    'student',
    0,
    new.raw_user_meta_data->>'full_name',
    coalesce((new.raw_user_meta_data->>'course_level')::smallint, 1)
  );
  return new;
end;
$$;

-- Admin-only update path, matching admin_update_student_school exactly --
-- profiles has no admin-write RLS policy, so this goes through a
-- SECURITY DEFINER RPC with an explicit admin check.
create or replace function public.admin_update_student_level(p_student_id uuid, p_level smallint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if get_my_role() is distinct from 'admin'::user_role then
    raise exception 'Only admins can change a student''s course level';
  end if;
  update public.profiles set course_level = p_level where id = p_student_id;
end;
$$;
