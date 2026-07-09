import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface EtfEntry {
  id: string;
  user_id: string;
  name: string;
  ticker: string;
  return_pct: number;
  submitted_at: string;
  student_name: string | null;
}

export function useEtfLeaderboard(_currentUserId?: string | null) {
  const [entries, setEntries] = useState<EtfEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('etf_submissions')
        .select(`
          id,
          user_id,
          name,
          ticker,
          return_pct,
          submitted_at,
          profiles:user_id (full_name)
        `)
        .order('return_pct', { ascending: false })
        .limit(10);

      if (data) {
        setEntries(data.map((e: any) => ({
          id: e.id,
          user_id: e.user_id,
          name: e.name,
          ticker: e.ticker,
          return_pct: e.return_pct ?? 0,
          submitted_at: e.submitted_at,
          student_name: e.profiles?.full_name ?? null,
        })));
      }
      setLoading(false);
    }
    fetch();
  }, []);

  return { entries, loading };
}
