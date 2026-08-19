-- Lets students submit feedback (subject + description) that only they and
-- admins can see, surfaced in the admin dashboard.

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null,
  description text not null,
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

drop policy if exists "Students can submit their own feedback" on public.feedback;
create policy "Students can submit their own feedback"
  on public.feedback for insert
  to authenticated
  with check (student_id = auth.uid());

drop policy if exists "Students and admins can view feedback" on public.feedback;
create policy "Students and admins can view feedback"
  on public.feedback for select
  to authenticated
  using (
    student_id = auth.uid()
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
