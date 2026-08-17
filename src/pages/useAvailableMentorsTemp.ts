import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Mentor } from './useMentor';

export function useAvailableMentors() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMentors() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'admin')
        .order('full_name', { ascending: true });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const rows: Mentor[] = (data ?? []).map((p: any) => ({
        id: p.id,
        name: p.full_name ?? 'InterStock Admin',
        title: 'InterStock Team',
        company: 'InterStock',
        expertise: null,
        available: true,
      }));

      setMentors(rows);
      setLoading(false);
    }
    fetchMentors();
  }, []);

  return { mentors, loading, error };
}