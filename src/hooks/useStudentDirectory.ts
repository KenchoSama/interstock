import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface DirectoryStudent {
  id: string;
  name: string;
  school: string | null;
}

export function useStudentDirectory(query: string) {
  const [students, setStudents] = useState<DirectoryStudent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function search() {
      setLoading(true);
      let q = supabase
        .from('profiles')
        .select('id, full_name, schools ( name )')
        .eq('role', 'student')
        .order('full_name', { ascending: true })
        .limit(50);

      if (query.trim().length >= 2) {
        q = q.ilike('full_name', `%${query.trim()}%`);
      }

      const { data } = await q;
      if (cancelled) return;

      setStudents(
        (data ?? []).map((p: any) => ({
          id: p.id,
          name: p.full_name ?? 'Student',
          school: p.schools?.name ?? null,
        }))
      );
      setLoading(false);
    }

    search();
    return () => { cancelled = true; };
  }, [query]);

  return { students, loading };
}