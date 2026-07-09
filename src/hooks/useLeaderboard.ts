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

export function useLeaderboard(userId?: string, limit = 5) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myEntry, setMyEntry] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('leaderboard')
        .select('id, full_name, xp, school_id, global_rank, return_pct, total_value')
        .order('global_rank', { ascending: true })
        .limit(limit);

      if (data) setEntries(data);

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
  }, [userId, limit]);

  // Keep top5 as alias for dashboard compatibility
  const top5 = entries.slice(0, 5);
  const leader = entries[0] ?? null;

  return { entries, top5, myEntry, loading, leader };
}
