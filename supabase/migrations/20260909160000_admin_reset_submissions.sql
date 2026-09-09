-- Submissions created before the upload fix have no actual file attached,
-- and a student has no way to redo a submission once it exists (no student
-- delete policy either, by design -- a submission shouldn't be erasable by
-- the person being graded on it). Admin needs to be able to clear a
-- student's submission record so they can resubmit -- either to backfill a
-- real file for a pre-fix submission, or to let a student redo one they
-- got wrong.
create policy "Admins can delete submissions"
  on public.submissions for delete
  to authenticated
  using (get_my_role() = 'admin'::user_role);
