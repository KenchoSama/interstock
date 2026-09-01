import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface TournamentSchoolRow {
  id: string;
  name: string;
  entered: boolean;
}

export function useAdminTournamentSchools(competitionId: string | null) {
  const [schools, setSchools] = useState<TournamentSchoolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchools = useCallback(async () => {
    if (!competitionId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const [schoolsRes, enteredRes] = await Promise.all([
      supabase.from('schools').select('id, name').order('name'),
      supabase.from('competition_schools').select('school_id').eq('competition_id', competitionId),
    ]);

    if (schoolsRes.error) {
      setError(schoolsRes.error.message);
      setLoading(false);
      return;
    }

    const enteredIds = new Set((enteredRes.data ?? []).map(r => r.school_id));
    setSchools((schoolsRes.data ?? []).map(s => ({ id: s.id, name: s.name, entered: enteredIds.has(s.id) })));
    setLoading(false);
  }, [competitionId]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  async function enterSchool(schoolId: string): Promise<{ error: string | null }> {
    if (!competitionId) return { error: 'No tournament selected.' };

    const { error } = await supabase.rpc('enter_school_in_tournament', {
      p_competition_id: competitionId,
      p_school_id: schoolId,
    });

    if (error) return { error: error.message };
    await fetchSchools();
    return { error: null };
  }

  return { schools, loading, error, enterSchool, refetch: fetchSchools };
}
