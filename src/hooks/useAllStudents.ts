import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface StudentRow {
  id: string;
  name: string;
  school: string | null;
  grade: number | null;
  xp: number;
  level: number;
  rank: number | null;
}

const LEVEL_THRESHOLDS = [0, 100, 200, 500, 1000, 1200, 1500, 2000, 2500, 3000];

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
        .select('id, full_name, grade, xp, school_id, schools ( name )')
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
      grade: p.grade,
      xp: p.xp ?? 0,
      level: LEVEL_THRESHOLDS.filter(t => t <= (p.xp ?? 0)).length,
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

  return { students, loading, error, deleteStudent, refetch: fetchStudents };
}