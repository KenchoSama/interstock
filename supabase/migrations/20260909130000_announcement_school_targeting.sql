-- Admin wants to target an announcement at one or more specific schools
-- instead of always broadcasting to every student (e.g. a note relevant to
-- only one partner school). Mirrors the existing `competition_schools`
-- junction-table pattern: no rows for an announcement means "all schools"
-- (the previous behavior), rows present means "only these schools." The
-- SELECT policy on `announcements` does the filtering itself, so the
-- student-side hook needs no changes at all.

create table if not exists public.announcement_schools (
  id uuid primary key default gen_random_uuid(),
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  unique (announcement_id, school_id)
);

create index if not exists announcement_schools_announcement_id_idx on public.announcement_schools (announcement_id);

alter table public.announcement_schools enable row level security;

drop policy if exists "Authenticated users can view announcement schools" on public.announcement_schools;
create policy "Authenticated users can view announcement schools"
  on public.announcement_schools for select
  to authenticated
  using (true);

drop policy if exists "Admins can insert announcement schools" on public.announcement_schools;
create policy "Admins can insert announcement schools"
  on public.announcement_schools for insert
  to authenticated
  with check (get_my_role() = 'admin'::user_role);

-- Replace the old "everyone sees everything" SELECT policy with one that
-- respects targeting: admins always see every announcement (for management),
-- everyone else sees untargeted (all-schools) announcements plus any
-- targeted at their own school.
drop policy if exists "Authenticated users can view announcements" on public.announcements;
create policy "Authenticated users can view announcements"
  on public.announcements for select
  to authenticated
  using (
    get_my_role() = 'admin'::user_role
    or not exists (
      select 1 from public.announcement_schools asch where asch.announcement_id = announcements.id
    )
    or exists (
      select 1
      from public.announcement_schools asch
      join public.profiles p on p.school_id = asch.school_id
      where asch.announcement_id = announcements.id and p.id = auth.uid()
    )
  );
