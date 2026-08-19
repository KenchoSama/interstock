-- The assignments table only had a read policy — admins couldn't create,
-- update (to attach a file_url), or delete assignments. Matches the same
-- open-to-authenticated-write convention used elsewhere in this app
-- (schools, profiles, holdings, etc.), since access is gated by the route.

drop policy if exists "Authenticated users can insert assignments" on public.assignments;
create policy "Authenticated users can insert assignments"
  on public.assignments for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update assignments" on public.assignments;
create policy "Authenticated users can update assignments"
  on public.assignments for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can delete assignments" on public.assignments;
create policy "Authenticated users can delete assignments"
  on public.assignments for delete
  to authenticated
  using (true);
