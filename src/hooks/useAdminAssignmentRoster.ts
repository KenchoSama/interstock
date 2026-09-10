import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface RosterRow {
  id: string;
  name: string;
  schoolName: string | null;
  submitted: boolean;
  status: 'pending' | 'submitted' | 'graded' | null;
  grade: number | null;
  submittedAt: string | null;
  fileUrl: string | null;
}

export function useAdminAssignmentRoster(
  assignmentId: string | null,
  targetSchoolId: string | null,
  targetCourseLevel: number | null
) {
  const [roster, setRoster] = useState<RosterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoster = useCallback(async () => {
    if (!assignmentId) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    let studentsQuery = supabase.from('profiles').select('id, full_name, school_id').eq('role', 'student');
    if (targetSchoolId) studentsQuery = studentsQuery.eq('school_id', targetSchoolId);
    if (targetCourseLevel) studentsQuery = studentsQuery.eq('course_level', targetCourseLevel);

    const [studentsRes, schoolsRes, subsRes] = await Promise.all([
      studentsQuery,
      supabase.from('schools').select('id, name'),
      supabase
        .from('submissions')
        .select('user_id, status, grade, submitted_at, file_url')
        .eq('assignment_id', assignmentId),
    ]);

    if (studentsRes.error) {
      setError(studentsRes.error.message);
      setLoading(false);
      return;
    }

    const schoolNameById = new Map((schoolsRes.data ?? []).map(s => [s.id, s.name]));
    const subByUser = new Map((subsRes.data ?? []).map(s => [s.user_id, s]));

    const rows: RosterRow[] = (studentsRes.data ?? [])
      .map(s => {
        const sub = subByUser.get(s.id);
        return {
          id: s.id,
          name: s.full_name ?? 'Unnamed student',
          schoolName: s.school_id ? schoolNameById.get(s.school_id) ?? null : null,
          submitted: !!sub,
          status: (sub?.status as RosterRow['status']) ?? null,
          grade: sub?.grade ?? null,
          submittedAt: sub?.submitted_at ?? null,
          fileUrl: sub?.file_url ?? null,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    setRoster(rows);
    setLoading(false);
  }, [assignmentId, targetSchoolId, targetCourseLevel]);

  useEffect(() => {
    fetchRoster();
  }, [fetchRoster]);

  async function resetSubmission(userId: string): Promise<{ error: string | null }> {
    if (!assignmentId) return { error: 'No assignment selected.' };

    const { error } = await supabase
      .from('submissions')
      .delete()
      .eq('assignment_id', assignmentId)
      .eq('user_id', userId);

    if (error) return { error: error.message };
    await fetchRoster();
    return { error: null };
  }

  return { roster, loading, error, resetSubmission, refetch: fetchRoster };
}
