-- Working (unfilled) limit orders for stock trading. Filled market orders
-- already live in `transactions` — this table only tracks orders that sit
-- pending until price conditions are met, are filled, or are canceled.

create table if not exists public.limit_orders (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  ticker text not null,
  side text not null check (side in ('buy', 'sell')),
  shares numeric not null check (shares > 0),
  limit_price numeric not null check (limit_price > 0),
  status text not null default 'working' check (status in ('working', 'filled', 'canceled')),
  created_at timestamptz not null default now(),
  filled_at timestamptz,
  filled_price numeric,
  canceled_at timestamptz
);

create index if not exists limit_orders_portfolio_id_idx on public.limit_orders (portfolio_id);

alter table public.limit_orders enable row level security;

drop policy if exists "Students can view their own limit orders" on public.limit_orders;
create policy "Students can view their own limit orders"
  on public.limit_orders for select
  to authenticated
  using (
    exists (
      select 1 from public.portfolios
      where portfolios.id = limit_orders.portfolio_id and portfolios.user_id = auth.uid()
    )
  );

drop policy if exists "Students can place their own limit orders" on public.limit_orders;
create policy "Students can place their own limit orders"
  on public.limit_orders for insert
  to authenticated
  with check (
    exists (
      select 1 from public.portfolios
      where portfolios.id = limit_orders.portfolio_id and portfolios.user_id = auth.uid()
    )
  );

drop policy if exists "Students can update their own limit orders" on public.limit_orders;
create policy "Students can update their own limit orders"
  on public.limit_orders for update
  to authenticated
  using (
    exists (
      select 1 from public.portfolios
      where portfolios.id = limit_orders.portfolio_id and portfolios.user_id = auth.uid()
    )
  );
