import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface SchoolRankEntry {
  schoolId: string;
  schoolName: string;
  rank: number;
  studentCount: number;
  avgReturnPct: number;
  avgXp: number;
}

export function useSchoolLeaderboard(mySchoolId?: string | null) {
  const [entries, setEntries] = useState<SchoolRankEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('leaderboard')
        .select('school_id, school_name, xp, return_pct');

      if (cancelled) return;

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const groups = new Map<string, { schoolName: string; xpSum: number; returnSum: number; count: number }>();
      for (const row of data ?? []) {
        if (!row.school_id) continue;
        const g = groups.get(row.school_id) ?? {
          schoolName: row.school_name ?? 'Unknown School',
          xpSum: 0,
          returnSum: 0,
          count: 0,
        };
        g.xpSum += row.xp ?? 0;
        g.returnSum += row.return_pct ?? 0;
        g.count += 1;
        groups.set(row.school_id, g);
      }

      const ranked: SchoolRankEntry[] = Array.from(groups.entries())
        .map(([schoolId, g]) => ({
          schoolId,
          schoolName: g.schoolName,
          studentCount: g.count,
          avgReturnPct: g.returnSum / g.count,
          avgXp: g.xpSum / g.count,
          rank: 0,
        }))
        .sort((a, b) => b.avgReturnPct - a.avgReturnPct)
        .map((s, i) => ({ ...s, rank: i + 1 }));

      setEntries(ranked);
      setLoading(false);
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  const myEntry = mySchoolId ? entries.find(e => e.schoolId === mySchoolId) ?? null : null;

  return { entries, myEntry, loading, error };
}
