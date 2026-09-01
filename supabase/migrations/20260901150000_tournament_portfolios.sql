-- Tournament portfolios: a student can now have a general portfolio (the
-- always-on one) plus one portfolio per tournament their school has entered.
-- Entry is school-admin-driven: a school admin opts their whole school into
-- a tournament in one action, which seeds a tournament portfolio for every
-- student at that school.

-- 1. competitions: add tournament configuration fields.
alter table public.competitions
  add column if not exists starting_cash numeric not null default 10000,
  add column if not exists start_date date,
  add column if not exists created_by uuid references public.profiles(id);

-- 2. portfolios: a nullable competition_id turns a portfolio into a
-- tournament portfolio. NULL = the student's general portfolio.
alter table public.portfolios
  add column if not exists competition_id uuid references public.competitions(id);

-- Drop any pre-existing unique constraint that only covers user_id — those
-- would block a student from having more than one portfolio row. We look it
-- up dynamically rather than guessing its name.
do $$
declare
  con record;
begin
  for con in
    select c.conname
    from pg_constraint c
    join pg_class rel on rel.oid = c.conrelid
    where rel.relname = 'portfolios'
      and c.contype in ('u', 'p')
      and (
        select array_agg(a.attname::text order by a.attnum)
        from pg_attribute a
        where a.attrelid = c.conrelid and a.attnum = any(c.conkey)
      ) = array['user_id']::text[]
  loop
    execute format('alter table public.portfolios drop constraint %I', con.conname);
  end loop;
end $$;

-- One general portfolio per student, and one portfolio per student per
-- tournament they're entered in.
drop index if exists portfolios_one_general_per_user;
create unique index portfolios_one_general_per_user
  on public.portfolios (user_id)
  where competition_id is null;

drop index if exists portfolios_one_per_user_per_competition;
create unique index portfolios_one_per_user_per_competition
  on public.portfolios (user_id, competition_id)
  where competition_id is not null;

-- 3. competition_schools: which schools have entered which tournaments.
create table if not exists public.competition_schools (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  entered_by uuid references public.profiles(id),
  entered_at timestamptz not null default now(),
  unique (competition_id, school_id)
);

alter table public.competition_schools enable row level security;

drop policy if exists "Authenticated users can view competition schools" on public.competition_schools;
create policy "Authenticated users can view competition schools"
  on public.competition_schools for select
  to authenticated
  using (true);

-- No direct insert/update/delete policies — entry happens only through the
-- enter_school_in_tournament RPC below, since it writes on behalf of every
-- student at a school, not just the caller's own row.

-- 4. RPC: bulk-enter a school into a tournament. Callable by school_admin or
-- admin only. Idempotent — safe to re-run to pick up students who joined the
-- school after the initial entry. Rejects entering a second concurrently
-- active tournament for the same school.
create or replace function public.enter_school_in_tournament(p_competition_id uuid, p_school_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_starting_cash numeric;
begin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('school_admin', 'admin')
  ) then
    raise exception 'Not authorized';
  end if;

  select starting_cash into v_starting_cash
  from public.competitions
  where id = p_competition_id;

  if v_starting_cash is null then
    raise exception 'Tournament not found';
  end if;

  if exists (
    select 1
    from public.competition_schools cs
    join public.competitions c on c.id = cs.competition_id
    where cs.school_id = p_school_id
      and c.status = 'active'
      and cs.competition_id <> p_competition_id
  ) then
    raise exception 'This school is already entered in another active tournament';
  end if;

  insert into public.competition_schools (competition_id, school_id, entered_by)
  values (p_competition_id, p_school_id, auth.uid())
  on conflict (competition_id, school_id) do nothing;

  insert into public.competition_registrations (competition_id, user_id)
  select p_competition_id, pr.id
  from public.profiles pr
  where pr.school_id = p_school_id
    and pr.role = 'student'
    and not exists (
      select 1 from public.competition_registrations cr
      where cr.competition_id = p_competition_id and cr.user_id = pr.id
    );

  insert into public.portfolios (user_id, competition_id, cash_balance, initial_balance)
  select pr.id, p_competition_id, v_starting_cash, v_starting_cash
  from public.profiles pr
  where pr.school_id = p_school_id
    and pr.role = 'student'
    and not exists (
      select 1 from public.portfolios po
      where po.user_id = pr.id and po.competition_id = p_competition_id
    );
end;
$$;

-- 5. RPC: reset a student's general portfolio only (never a tournament one).
-- Callable by admin only.
create or replace function public.reset_student_portfolio(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_portfolio_id uuid;
begin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Not authorized';
  end if;

  select id into v_portfolio_id
  from public.portfolios
  where user_id = p_user_id and competition_id is null;

  if v_portfolio_id is null then
    raise exception 'No general portfolio found for this student';
  end if;

  delete from public.limit_orders where portfolio_id = v_portfolio_id;
  delete from public.option_positions where portfolio_id = v_portfolio_id;
  delete from public.futures_positions where portfolio_id = v_portfolio_id;
  delete from public.transactions where portfolio_id = v_portfolio_id;
  delete from public.holdings where portfolio_id = v_portfolio_id;

  update public.portfolios
  set cash_balance = 10000, initial_balance = 10000
  where id = v_portfolio_id;
end;
$$;
