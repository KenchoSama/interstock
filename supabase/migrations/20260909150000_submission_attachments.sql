-- A student "submitting" an assignment only ever flipped a status flag --
-- the file-upload dropzone in the UI captured a filename locally but never
-- uploaded anything, so there was no actual submitted work for admin to
-- review or export. Adds a real attachment column plus a storage bucket for
-- it, mirroring the `assignments` bucket pattern exactly (public bucket,
-- any authenticated user can upload into it -- access is controlled by
-- which page/flow reaches it, same as the assignments attachment bucket).

alter table public.submissions
  add column if not exists file_url text;

insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', true)
on conflict (id) do nothing;

drop policy if exists "Submission files are publicly accessible" on storage.objects;
create policy "Submission files are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'submissions');

drop policy if exists "Authenticated users can upload submission files" on storage.objects;
create policy "Authenticated users can upload submission files"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'submissions');
