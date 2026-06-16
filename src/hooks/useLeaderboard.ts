import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface LeaderboardEntry {
  id: string;
  full_name: string;
  xp: number;
  school_id: string | null;
  global_rank: number;
  return_pct: number;
  total_value: number;
}

export function useLeaderboard(userId?: string) {
  const [top5, setTop5] = useState<LeaderboardEntry[]>([]);
  const [myEntry, setMyEntry] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('leaderboard')
        .select('id, full_name, xp, school_id, global_rank, return_pct, total_value')
        .order('global_rank', { ascending: true })
        .limit(5);

      if (data) setTop5(data);

      if (userId) {
        const { data: me } = await supabase
          .from('leaderboard')
          .select('id, full_name, xp, school_id, global_rank, return_pct, total_value')
          .eq('id', userId)
          .single();
        setMyEntry(me ?? null);
      }

      setLoading(false);
    }
    fetch();
  }, [userId]);

  return { top5, myEntry, loading };
}
