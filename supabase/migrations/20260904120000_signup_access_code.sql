-- Access code required for new student sign-ups, admin-editable from the
-- dashboard. A small key/value settings table (rather than a one-off column
-- somewhere) so more admin-editable settings can be added the same way later.
create table if not exists public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (key, value)
values ('student_signup_code', 'interstock2026')
on conflict (key) do nothing;

alter table public.app_settings enable row level security;

-- Readable by anyone, including anon — the sign-up form checks the code
-- before a session exists.
drop policy if exists "Anyone can read app settings" on public.app_settings;
create policy "Anyone can read app settings"
  on public.app_settings for select
  using (true);

-- Writes go through this RPC (SECURITY DEFINER, admin-only) rather than a
-- direct RLS write policy — matches the enter_school_in_tournament /
-- reset_student_portfolio precedent for admin-only mutations.
create or replace function public.update_signup_access_code(p_new_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Only admins can update the signup access code';
  end if;

  if p_new_code is null or length(trim(p_new_code)) = 0 then
    raise exception 'Access code cannot be empty';
  end if;

  update public.app_settings
  set value = trim(p_new_code), updated_at = now()
  where key = 'student_signup_code';
end;
$$;
