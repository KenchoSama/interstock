import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface SchoolStat {
  school_id: string;
  school_name: string;
  student_count: number;
  avg_quiz_score: number | null;
  avg_lessons_completed: number | null;
}

interface AdminOverview {
  schools: SchoolStat[];
  totalStudents: number;
  totalCompetitions: number;
  activeCompetitions: number;
  loading: boolean;
  error: string | null;
  addSchool: (name: string) => Promise<{ error: string | null }>;
  deleteSchool: (id: string) => Promise<{ error: string | null }>;
}

export function useAdminOverview(): AdminOverview {
  const [schools, setSchools] = useState<SchoolStat[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalCompetitions, setTotalCompetitions] = useState(0);
  const [activeCompetitions, setActiveCompetitions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchOverview() {
    setLoading(true);
    setError(null);

    const [schoolsRes, studentsRes, compsRes] = await Promise.all([
      supabase.from('school_stats').select('*'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('competitions').select('status'),
    ]);

    if (schoolsRes.error) {
      setError(schoolsRes.error.message);
      setLoading(false);
      return;
    }

    setSchools(schoolsRes.data ?? []);
    setTotalStudents(studentsRes.count ?? 0);

    // Non-fatal: competitions table shape may differ, don't block the rest of the dashboard on it
    if (!compsRes.error) {
      const comps = compsRes.data ?? [];
      setTotalCompetitions(comps.length);
      setActiveCompetitions(comps.filter((c: any) => c.status === 'active').length);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchOverview();
  }, []);

  async function addSchool(name: string): Promise<{ error: string | null }> {
    const trimmed = name.trim();
    if (!trimmed) return { error: 'School name is required.' };

    const { error } = await supabase.from('schools').insert({ name: trimmed });
    if (error) return { error: error.message };

    await fetchOverview();
    return { error: null };
  }

  async function deleteSchool(id: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from('schools').delete().eq('id', id);
    if (error) {
      if (error.code === '23503') {
        return { error: 'This school still has students enrolled. Reassign or remove them first.' };
      }
      return { error: error.message };
    }

    await fetchOverview();
    return { error: null };
  }

  return { schools, totalStudents, totalCompetitions, activeCompetitions, loading, error, addSchool, deleteSchool };
}