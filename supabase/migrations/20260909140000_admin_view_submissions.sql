-- `submissions` only had SELECT policies scoped to `auth.uid() = user_id`
-- (a student viewing their own submissions). Admins had no read access at
-- all, so the admin Assignments page's submission-count query silently came
-- back empty via RLS -- the "0/71" badge never reflected real submissions,
-- no matter how many students actually turned work in.
create policy "Admins can view all submissions"
  on public.submissions for select
  to authenticated
  using (get_my_role() = 'admin'::user_role);
