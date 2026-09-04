-- Lets admins promote a student to admin from the dashboard.
--
-- Found and fixed a real privilege-escalation hole while building this:
-- "Users can update own profile" (using (id = auth.uid())) has no column
-- restriction, so any authenticated user could currently run
-- `update profiles set role = 'admin' where id = auth.uid()` themselves and
-- it would succeed. A BEFORE UPDATE trigger closes this regardless of which
-- policy let the UPDATE through — it blocks any change to `role` unless the
-- caller performing the update is already an admin.
create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and get_my_role() is distinct from 'admin'::user_role then
    raise exception 'Only admins can change a user''s role';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_role_change_admin_only on public.profiles;
create trigger enforce_role_change_admin_only
  before update on public.profiles
  for each row
  execute function public.prevent_role_self_escalation();

-- Admin-facing RPC for the actual role change (the trigger above is the
-- security backstop, this is the sanctioned path the app UI calls).
create or replace function public.set_user_role(p_user_id uuid, p_new_role user_role)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if get_my_role() is distinct from 'admin'::user_role then
    raise exception 'Only admins can change a user''s role';
  end if;

  update public.profiles set role = p_new_role where id = p_user_id;
end;
$$;
