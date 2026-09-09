-- Admin needs a way to broadcast a message to every student (e.g. platform
-- updates, tournament reminders) without DMing each one via `messages`,
-- which is 1:1. `announcements` is a single global feed everyone can read;
-- `announcement_reads` is a per-student junction table tracking which
-- announcements a student has opened, mirroring the read/unread pattern
-- `messages.read` uses for the inbox badge, but as a join table since one
-- announcement has many readers instead of one boolean per row.

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists announcements_created_at_idx on public.announcements (created_at desc);

alter table public.announcements enable row level security;

drop policy if exists "Authenticated users can view announcements" on public.announcements;
create policy "Authenticated users can view announcements"
  on public.announcements for select
  to authenticated
  using (true);

drop policy if exists "Admins can insert announcements" on public.announcements;
create policy "Admins can insert announcements"
  on public.announcements for insert
  to authenticated
  with check (get_my_role() = 'admin'::user_role);

drop policy if exists "Admins can update announcements" on public.announcements;
create policy "Admins can update announcements"
  on public.announcements for update
  to authenticated
  using (get_my_role() = 'admin'::user_role);

drop policy if exists "Admins can delete announcements" on public.announcements;
create policy "Admins can delete announcements"
  on public.announcements for delete
  to authenticated
  using (get_my_role() = 'admin'::user_role);

create table if not exists public.announcement_reads (
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (announcement_id, user_id)
);

create index if not exists announcement_reads_user_id_idx on public.announcement_reads (user_id);

alter table public.announcement_reads enable row level security;

drop policy if exists "Users can view their own announcement reads" on public.announcement_reads;
create policy "Users can view their own announcement reads"
  on public.announcement_reads for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can mark announcements as read" on public.announcement_reads;
create policy "Users can mark announcements as read"
  on public.announcement_reads for insert
  to authenticated
  with check (user_id = auth.uid());
