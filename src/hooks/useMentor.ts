import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string;
  expertise: string | null;
  available: boolean;
}

export function useMentor(userId?: string) {
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    async function fetch() {
      const { data } = await supabase
        .from('mentor_assignments')
        .select(`
          mentor:mentor_id (
            id,
            name,
            title,
            company,
            expertise,
            available
          )
        `)
        .eq('student_id', userId)
        .single();

      console.log('mentor data:', data);
      setMentor((data?.mentor as Mentor) ?? null);
      setLoading(false);
    }
    fetch();
  }, [userId]);

  return { mentor, loading };
}
