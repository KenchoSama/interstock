-- Promoting a student to admin left their old school_id in place, which
-- later blocks deleting that school (FK violation) since the row is no
-- longer reachable from the admin dashboard's student list (it only shows
-- role = 'student'). An admin isn't tied to a school, so clear it on
-- promotion.
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

  update public.profiles
  set role = p_new_role,
      school_id = case when p_new_role = 'admin'::user_role then null else school_id end
  where id = p_user_id;
end;
$$;
