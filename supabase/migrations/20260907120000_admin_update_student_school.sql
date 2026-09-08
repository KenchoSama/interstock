-- Lets admin reassign a student's school from the dashboard. `profiles` has
-- no admin-write policy (only "Users can update own profile", id = auth.uid()),
-- so this goes through a SECURITY DEFINER RPC with an explicit admin check,
-- matching the set_user_role / reset_student_portfolio precedent for
-- admin-only mutations on another user's row.
create or replace function public.admin_update_student_school(p_student_id uuid, p_school_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if get_my_role() is distinct from 'admin'::user_role then
    raise exception 'Only admins can change a student''s school';
  end if;

  update public.profiles set school_id = p_school_id where id = p_student_id;
end;
$$;
