-- Schools are now admin-managed only, from the admin dashboard — students
-- pick from a dropdown at onboarding instead of typing a name and
-- self-creating a row. `schools_insert_authenticated` let any authenticated
-- user (including students) create a school; replacing it with an
-- admin-only check.
--
-- Also fixes a latent gap found while making this change: there was no
-- DELETE policy on `schools` at all, so the existing admin dashboard's
-- "Delete School" button was silently deleting 0 rows (RLS blocks it,
-- and a 0-row DELETE isn't a Postgres error) rather than actually working.
drop policy if exists "schools_insert_authenticated" on public.schools;

create policy "Admins can insert schools"
  on public.schools for insert
  with check (get_my_role() = 'admin'::user_role);

create policy "Admins can delete schools"
  on public.schools for delete
  using (get_my_role() = 'admin'::user_role);
