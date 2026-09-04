-- Class Fund: a single shared portfolio multiple students can trade together,
-- created by admin (only admin/student roles are actually in use — same
-- role substitution as tournament school-entry) and joined by students via
-- a code. Kept as its own parallel mini-schema rather than overloading
-- `portfolios` (which is owned by exactly one user_id with per-user unique
-- constraints) since a class fund belongs to nobody in particular.

create table if not exists public.class_funds (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  starting_cash numeric not null default 10000,
  cash_balance numeric not null default 10000,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.class_fund_members (
  class_fund_id uuid not null references public.class_funds(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (class_fund_id, user_id)
);

create table if not exists public.class_fund_holdings (
  id uuid primary key default gen_random_uuid(),
  class_fund_id uuid not null references public.class_funds(id) on delete cascade,
  ticker text not null,
  shares numeric not null,
  avg_cost numeric not null,
  unique (class_fund_id, ticker)
);

create table if not exists public.class_fund_transactions (
  id uuid primary key default gen_random_uuid(),
  class_fund_id uuid not null references public.class_funds(id) on delete cascade,
  user_id uuid references public.profiles(id),
  ticker text not null,
  type text not null,
  shares numeric not null,
  price numeric not null,
  executed_at timestamptz not null default now()
);

alter table public.class_funds enable row level security;
alter table public.class_fund_members enable row level security;
alter table public.class_fund_holdings enable row level security;
alter table public.class_fund_transactions enable row level security;

-- class_funds: readable by anyone (needed so a student can look up a fund by
-- code before joining, same reasoning as competitions/schools being open
-- reads); writes only through the RPCs below or admin-only delete.
create policy "Anyone can view class funds"
  on public.class_funds for select
  using (true);

create policy "Admins can delete class funds"
  on public.class_funds for delete
  using (get_my_role() = 'admin'::user_role);

-- class_fund_members: a student can see their own membership rows (enough to
-- know which fund(s) they're in); no direct writes, only via join_class_fund.
create policy "Users can view their own class fund memberships"
  on public.class_fund_members for select
  using (user_id = auth.uid());

-- class_fund_holdings / class_fund_transactions: readable by fund members or
-- admin (oversight); writes only through trade_class_fund.
create policy "Members can view class fund holdings"
  on public.class_fund_holdings for select
  using (
    get_my_role() = 'admin'::user_role
    or exists (
      select 1 from public.class_fund_members m
      where m.class_fund_id = class_fund_holdings.class_fund_id and m.user_id = auth.uid()
    )
  );

create policy "Members can view class fund transactions"
  on public.class_fund_transactions for select
  using (
    get_my_role() = 'admin'::user_role
    or exists (
      select 1 from public.class_fund_members m
      where m.class_fund_id = class_fund_transactions.class_fund_id and m.user_id = auth.uid()
    )
  );

-- Admin creates a class fund and sets its shareable code.
create or replace function public.create_class_fund(p_name text, p_code text, p_starting_cash numeric)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if get_my_role() is distinct from 'admin'::user_role then
    raise exception 'Only admins can create class funds';
  end if;

  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'Name is required';
  end if;
  if p_code is null or length(trim(p_code)) = 0 then
    raise exception 'Code is required';
  end if;

  insert into public.class_funds (name, code, starting_cash, cash_balance, created_by)
  values (trim(p_name), upper(trim(p_code)), p_starting_cash, p_starting_cash, auth.uid())
  returning id into v_id;

  return v_id;
end;
$$;

-- Student redeems a code to join a class fund. Idempotent.
create or replace function public.join_class_fund(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_fund_id uuid;
begin
  select id into v_fund_id from public.class_funds where code = upper(trim(p_code));
  if v_fund_id is null then
    raise exception 'No class fund found with that code';
  end if;

  insert into public.class_fund_members (class_fund_id, user_id)
  values (v_fund_id, auth.uid())
  on conflict do nothing;

  return v_fund_id;
end;
$$;

-- The only way holdings/cash/transactions change — serializes concurrent
-- trades from different members via `for update` row locks, since multiple
-- students share the same cash balance and holdings.
create or replace function public.trade_class_fund(
  p_fund_id uuid, p_ticker text, p_type text, p_shares numeric, p_price numeric
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cash numeric;
  v_existing_shares numeric;
  v_existing_avg numeric;
  v_cost numeric := p_shares * p_price;
begin
  if not exists (
    select 1 from public.class_fund_members
    where class_fund_id = p_fund_id and user_id = auth.uid()
  ) then
    raise exception 'You are not a member of this class fund';
  end if;

  if p_shares <= 0 or p_price <= 0 then
    raise exception 'Invalid trade amount';
  end if;

  select cash_balance into v_cash from public.class_funds where id = p_fund_id for update;
  if v_cash is null then
    raise exception 'Class fund not found';
  end if;

  if p_type = 'buy' then
    if v_cost > v_cash then
      raise exception 'Insufficient cash balance';
    end if;

    select shares, avg_cost into v_existing_shares, v_existing_avg
    from public.class_fund_holdings where class_fund_id = p_fund_id and ticker = p_ticker for update;

    if v_existing_shares is null then
      insert into public.class_fund_holdings (class_fund_id, ticker, shares, avg_cost)
      values (p_fund_id, p_ticker, p_shares, p_price);
    else
      update public.class_fund_holdings
      set shares = v_existing_shares + p_shares,
          avg_cost = ((v_existing_shares * v_existing_avg) + v_cost) / (v_existing_shares + p_shares)
      where class_fund_id = p_fund_id and ticker = p_ticker;
    end if;

    update public.class_funds set cash_balance = v_cash - v_cost where id = p_fund_id;

  elsif p_type = 'sell' then
    select shares, avg_cost into v_existing_shares, v_existing_avg
    from public.class_fund_holdings where class_fund_id = p_fund_id and ticker = p_ticker for update;

    if v_existing_shares is null or v_existing_shares < p_shares then
      raise exception 'Not enough shares to sell';
    end if;

    if v_existing_shares = p_shares then
      delete from public.class_fund_holdings where class_fund_id = p_fund_id and ticker = p_ticker;
    else
      update public.class_fund_holdings set shares = v_existing_shares - p_shares
      where class_fund_id = p_fund_id and ticker = p_ticker;
    end if;

    update public.class_funds set cash_balance = v_cash + v_cost where id = p_fund_id;
  else
    raise exception 'Invalid trade type';
  end if;

  insert into public.class_fund_transactions (class_fund_id, user_id, ticker, type, shares, price)
  values (p_fund_id, auth.uid(), p_ticker, p_type, p_shares, p_price);
end;
$$;
