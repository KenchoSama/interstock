import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface AdminCompetition {
  id: string;
  name: string;
  type: string;
  prize: string | null;
  status: string;
  xpRequired: number;
  startDate: string | null;
  deadline: string | null;
  startingCash: number;
  schoolCount: number;
  studentCount: number;
}

export function useAdminCompetitions() {
  const [competitions, setCompetitions] = useState<AdminCompetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompetitions = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [compsRes, schoolsRes, regsRes] = await Promise.all([
      supabase
        .from('competitions')
        .select('id, name, type, prize, status, xp_required, start_date, deadline, starting_cash')
        .order('start_date', { ascending: false }),
      supabase.from('competition_schools').select('competition_id'),
      supabase.from('competition_registrations').select('competition_id'),
    ]);

    if (compsRes.error) {
      setError(compsRes.error.message);
      setLoading(false);
      return;
    }

    const schoolCounts = new Map<string, number>();
    for (const r of schoolsRes.data ?? []) {
      schoolCounts.set(r.competition_id, (schoolCounts.get(r.competition_id) ?? 0) + 1);
    }
    const studentCounts = new Map<string, number>();
    for (const r of regsRes.data ?? []) {
      studentCounts.set(r.competition_id, (studentCounts.get(r.competition_id) ?? 0) + 1);
    }

    setCompetitions(
      (compsRes.data ?? []).map(c => ({
        id: c.id,
        name: c.name,
        type: c.type,
        prize: c.prize,
        status: c.status,
        xpRequired: c.xp_required ?? 0,
        startDate: c.start_date,
        deadline: c.deadline,
        startingCash: c.starting_cash ?? 10000,
        schoolCount: schoolCounts.get(c.id) ?? 0,
        studentCount: studentCounts.get(c.id) ?? 0,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCompetitions();
  }, [fetchCompetitions]);

  async function createCompetition(input: {
    name: string;
    type: string;
    prize: string;
    startingCash: number;
    startDate: string;
    deadline: string;
    xpRequired: number;
  }): Promise<{ error: string | null }> {
    const { error } = await supabase.from('competitions').insert({
      name: input.name.trim(),
      type: input.type.trim() || 'Trading Challenge',
      prize: input.prize.trim() || null,
      status: 'upcoming',
      xp_required: input.xpRequired,
      start_date: input.startDate || null,
      deadline: input.deadline || null,
      starting_cash: input.startingCash,
    });

    if (error) return { error: error.message };
    await fetchCompetitions();
    return { error: null };
  }

  async function updateStatus(id: string, status: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from('competitions').update({ status }).eq('id', id);
    if (error) return { error: error.message };
    await fetchCompetitions();
    return { error: null };
  }

  async function deleteCompetition(id: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from('competitions').delete().eq('id', id);
    if (error) return { error: error.message };
    await fetchCompetitions();
    return { error: null };
  }

  return { competitions, loading, error, createCompetition, updateStatus, deleteCompetition, refetch: fetchCompetitions };
}
