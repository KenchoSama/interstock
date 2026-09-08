-- Deleting a competition directly violated two foreign keys:
-- competition_registrations_competition_id_fkey and
-- portfolios_competition_id_fkey (both RESTRICT). competition_schools
-- already cascades. Tournament portfolios' own children (holdings,
-- transactions, option/futures positions, limit/option orders) all cascade
-- from portfolios except portfolio_snapshots, which is also RESTRICT.
--
-- This RPC cleans up in dependency order, matching the
-- delete_student_account precedent for admin-only cascading deletes.
create or replace function public.delete_competition(p_competition_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if get_my_role() is distinct from 'admin'::user_role then
    raise exception 'Only admins can delete a tournament';
  end if;

  delete from public.competition_registrations where competition_id = p_competition_id;

  if to_regclass('public.portfolio_snapshots') is not null then
    delete from public.portfolio_snapshots
    where portfolio_id in (select id from public.portfolios where competition_id = p_competition_id);
  end if;

  delete from public.portfolios where competition_id = p_competition_id;

  delete from public.competitions where id = p_competition_id;
end;
$$;
