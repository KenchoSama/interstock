-- Lets an assignment carry an optional PDF attachment, and adds a public
-- storage bucket to hold those files (mirrors the avatars bucket pattern).

alter table public.assignments
  add column if not exists file_url text;

insert into storage.buckets (id, name, public)
values ('assignments', 'assignments', true)
on conflict (id) do nothing;

drop policy if exists "Assignment files are publicly accessible" on storage.objects;
create policy "Assignment files are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'assignments');

drop policy if exists "Authenticated users can upload assignment files" on storage.objects;
create policy "Authenticated users can upload assignment files"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'assignments');
