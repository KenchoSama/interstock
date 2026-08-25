-- Paper-trading futures positions. Opening a position posts margin (deducted
-- from the student's portfolio cash); closing returns that margin plus/minus
-- the leveraged P&L, floored at zero so a single position can't drive cash
-- negative.

create table if not exists public.futures_positions (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  ticker text not null,
  side text not null check (side in ('long', 'short')),
  contracts integer not null check (contracts > 0),
  entry_price numeric not null,
  multiplier numeric not null,
  margin_posted numeric not null,
  opened_at timestamptz not null default now(),
  status text not null default 'open' check (status in ('open', 'closed')),
  close_price numeric,
  close_value numeric,
  closed_at timestamptz
);

create index if not exists futures_positions_portfolio_id_idx on public.futures_positions (portfolio_id);

alter table public.futures_positions enable row level security;

drop policy if exists "Students can view their own futures positions" on public.futures_positions;
create policy "Students can view their own futures positions"
  on public.futures_positions for select
  to authenticated
  using (
    exists (
      select 1 from public.portfolios
      where portfolios.id = futures_positions.portfolio_id and portfolios.user_id = auth.uid()
    )
  );

drop policy if exists "Students can open their own futures positions" on public.futures_positions;
create policy "Students can open their own futures positions"
  on public.futures_positions for insert
  to authenticated
  with check (
    exists (
      select 1 from public.portfolios
      where portfolios.id = futures_positions.portfolio_id and portfolios.user_id = auth.uid()
    )
  );

drop policy if exists "Students can close their own futures positions" on public.futures_positions;
create policy "Students can close their own futures positions"
  on public.futures_positions for update
  to authenticated
  using (
    exists (
      select 1 from public.portfolios
      where portfolios.id = futures_positions.portfolio_id and portfolios.user_id = auth.uid()
    )
  );
