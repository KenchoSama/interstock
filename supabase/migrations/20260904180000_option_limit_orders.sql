-- Limit orders for options — mirrors the existing stock `limit_orders` table
-- and RLS shape (per-portfolio ownership check via auth.uid(), no admin
-- involvement needed since a student only ever touches their own rows).
create table if not exists public.option_orders (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  ticker text not null,
  option_type text not null,
  strike numeric not null,
  expiry_date date not null,
  contracts integer not null,
  limit_price numeric not null,
  status text not null default 'working',
  created_at timestamptz not null default now(),
  filled_at timestamptz,
  filled_price numeric,
  canceled_at timestamptz
);

alter table public.option_orders enable row level security;

create policy "Students can place their own option orders"
  on public.option_orders for insert
  with check (exists (
    select 1 from public.portfolios
    where portfolios.id = option_orders.portfolio_id and portfolios.user_id = auth.uid()
  ));

create policy "Students can view their own option orders"
  on public.option_orders for select
  using (exists (
    select 1 from public.portfolios
    where portfolios.id = option_orders.portfolio_id and portfolios.user_id = auth.uid()
  ));

create policy "Students can update their own option orders"
  on public.option_orders for update
  using (exists (
    select 1 from public.portfolios
    where portfolios.id = option_orders.portfolio_id and portfolios.user_id = auth.uid()
  ));
