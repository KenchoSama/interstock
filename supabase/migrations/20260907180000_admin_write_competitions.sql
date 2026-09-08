-- `competitions` had RLS enabled with only a SELECT policy — INSERT/UPDATE/
-- DELETE were silently blocked for everyone, including admin, so the admin
-- Tournaments page's create/status-change/delete actions all no-op'd.
-- Restricting writes to admin, matching the schools/class_funds precedent.
create policy "Admins can insert competitions"
  on public.competitions for insert
  with check (get_my_role() = 'admin'::user_role);

create policy "Admins can update competitions"
  on public.competitions for update
  using (get_my_role() = 'admin'::user_role);

create policy "Admins can delete competitions"
  on public.competitions for delete
  using (get_my_role() = 'admin'::user_role);
