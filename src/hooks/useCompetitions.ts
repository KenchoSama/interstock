import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Competition {
  id: string;
  name: string;
  type: string;
  prize: string | null;
  deadline: string | null;
  status: string;
  xp_required: number;
  participants: number;
  registered: boolean;
}

export function useCompetitions(userId?: string | null) {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    async function fetch() {
      // Fetch competitions
      const { data: comps } = await supabase
        .from('competitions')
        .select('id, name, type, prize, deadline, status, xp_required')
        .order('deadline', { ascending: true });

      if (!comps) { setLoading(false); return; }

      // Fetch participant counts
      const { data: regs } = await supabase
        .from('competition_registrations')
        .select('competition_id, user_id');

      // Fetch student's registrations
      const myRegs = new Set((regs ?? [])
        .filter(r => r.user_id === userId)
        .map(r => r.competition_id));

      // Count participants per competition
      const countMap = (regs ?? []).reduce<Record<string, number>>((acc, r) => {
        acc[r.competition_id] = (acc[r.competition_id] ?? 0) + 1;
        return acc;
      }, {});

      setCompetitions(comps.map(c => ({
        ...c,
        participants: countMap[c.id] ?? 0,
        registered: myRegs.has(c.id),
      })));

      setLoading(false);
    }

    fetch();
  }, [userId]);

  const register = useCallback(async (competitionId: string, userId: string) => {
    const { error } = await supabase
      .from('competition_registrations')
      .insert({ competition_id: competitionId, user_id: userId });

    if (!error) {
      setCompetitions(prev => prev.map(c =>
        c.id === competitionId
          ? { ...c, registered: true, participants: c.participants + 1 }
          : c
      ));
    }
  }, []);

  return { competitions, loading, register };
}
