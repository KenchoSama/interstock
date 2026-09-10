-- Admin needs to target an assignment at students in a specific school
-- and/or a specific program level, instead of always broadcasting to every
-- student. `school_id` already existed on assignments but was always
-- inserted as null and never actually filtered by; course_level is new.
-- Both null = no restriction on that dimension, so leaving both blank still
-- broadcasts to everyone (today's behavior).

alter table public.assignments
  add column if not exists course_level smallint check (course_level in (1, 2, 3));

-- The previous SELECT state was a blanket `using (true)` ("Students can view
-- assignments") plus a dormant, narrower school-scoped policy ("View school
-- assignments") that permissive-OR'd with the blanket one and so never
-- actually restricted anything. Replace both with one policy that does the
-- real targeting: admins see everything; everyone else sees an assignment
-- only if it's untargeted (null) or matches their own school_id /
-- course_level on each dimension independently.
drop policy if exists "Students can view assignments" on public.assignments;
drop policy if exists "View school assignments" on public.assignments;

create policy "Users can view targeted assignments"
  on public.assignments for select
  to authenticated
  using (
    get_my_role() = 'admin'::user_role
    or (
      (school_id is null or school_id = (select p.school_id from public.profiles p where p.id = auth.uid()))
      and (course_level is null or course_level = (select p.course_level from public.profiles p where p.id = auth.uid()))
    )
  );
