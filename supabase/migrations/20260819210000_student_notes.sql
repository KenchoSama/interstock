-- Personal notepad for students. Fully private to the owning student.

create table if not exists public.student_notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Untitled Note',
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists student_notes_student_id_idx on public.student_notes (student_id);

alter table public.student_notes enable row level security;

drop policy if exists "Students can view their own notes" on public.student_notes;
create policy "Students can view their own notes"
  on public.student_notes for select
  to authenticated
  using (student_id = auth.uid());

drop policy if exists "Students can create their own notes" on public.student_notes;
create policy "Students can create their own notes"
  on public.student_notes for insert
  to authenticated
  with check (student_id = auth.uid());

drop policy if exists "Students can update their own notes" on public.student_notes;
create policy "Students can update their own notes"
  on public.student_notes for update
  to authenticated
  using (student_id = auth.uid());

drop policy if exists "Students can delete their own notes" on public.student_notes;
create policy "Students can delete their own notes"
  on public.student_notes for delete
  to authenticated
  using (student_id = auth.uid());
