import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface StudentRow {
  id: string;
  name: string;
  school: string | null;
  schoolId: string | null;
  grade: number | null;
  xp: number;
  courseLevel: number;
  rank: number | null;
}

export function useAllStudents() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchStudents() {
    setLoading(true);
    setError(null);

    const [profilesRes, rankRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, grade, xp, course_level, school_id, schools ( name )')
        .eq('role', 'student')
        .order('full_name', { ascending: true }),
      supabase.from('leaderboard').select('id, global_rank'),
    ]);

    if (profilesRes.error || rankRes.error) {
      setError(profilesRes.error?.message ?? rankRes.error?.message ?? 'Failed to load students');
      setLoading(false);
      return;
    }

    const rankMap = new Map((rankRes.data ?? []).map((r: any) => [r.id, r.global_rank]));

    const rows: StudentRow[] = (profilesRes.data ?? []).map((p: any) => ({
      id: p.id,
      name: p.full_name ?? 'Unknown',
      school: p.schools?.name ?? null,
      schoolId: p.school_id ?? null,
      grade: p.grade,
      xp: p.xp ?? 0,
      courseLevel: p.course_level ?? 1,
      rank: rankMap.get(p.id) ?? null,
    }));

    setStudents(rows);
    setLoading(false);
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  async function deleteStudent(id: string): Promise<{ error: string | null }> {
    const { error } = await supabase.rpc('delete_student_account', { target_id: id });
    if (error) return { error: error.message };
    await fetchStudents();
    return { error: null };
  }

  async function promoteToAdmin(id: string): Promise<{ error: string | null }> {
    const { error } = await supabase.rpc('set_user_role', { p_user_id: id, p_new_role: 'admin' });
    if (error) return { error: error.message };
    await fetchStudents();
    return { error: null };
  }

  async function updateStudentSchool(id: string, schoolId: string | null): Promise<{ error: string | null }> {
    const { error } = await supabase.rpc('admin_update_student_school', { p_student_id: id, p_school_id: schoolId });
    if (error) return { error: error.message };
    await fetchStudents();
    return { error: null };
  }

  async function updateStudentLevel(id: string, level: number): Promise<{ error: string | null }> {
    const { error } = await supabase.rpc('admin_update_student_level', { p_student_id: id, p_level: level });
    if (error) return { error: error.message };
    await fetchStudents();
    return { error: null };
  }

  return { students, loading, error, deleteStudent, promoteToAdmin, updateStudentSchool, updateStudentLevel, refetch: fetchStudents };
}