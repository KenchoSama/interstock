-- Paper-trading options positions. A position is opened by paying a premium
-- and closed (any time, including after expiry) by selling at the then-current
-- market price for that contract, both settled against the student's existing
-- portfolio cash balance.

create table if not exists public.option_positions (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  ticker text not null,
  option_type text not null check (option_type in ('call', 'put')),
  strike numeric not null,
  contracts integer not null check (contracts > 0),
  premium_paid numeric not null,
  opened_at timestamptz not null default now(),
  expiry_date date not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  close_value numeric,
  closed_at timestamptz
);

create index if not exists option_positions_portfolio_id_idx on public.option_positions (portfolio_id);

alter table public.option_positions enable row level security;

drop policy if exists "Students can view their own option positions" on public.option_positions;
create policy "Students can view their own option positions"
  on public.option_positions for select
  to authenticated
  using (
    exists (
      select 1 from public.portfolios
      where portfolios.id = option_positions.portfolio_id and portfolios.user_id = auth.uid()
    )
  );

drop policy if exists "Students can open their own option positions" on public.option_positions;
create policy "Students can open their own option positions"
  on public.option_positions for insert
  to authenticated
  with check (
    exists (
      select 1 from public.portfolios
      where portfolios.id = option_positions.portfolio_id and portfolios.user_id = auth.uid()
    )
  );

drop policy if exists "Students can close their own option positions" on public.option_positions;
create policy "Students can close their own option positions"
  on public.option_positions for update
  to authenticated
  using (
    exists (
      select 1 from public.portfolios
      where portfolios.id = option_positions.portfolio_id and portfolios.user_id = auth.uid()
    )
  );
