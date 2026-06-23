import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface PortfolioSnapshot {
  total_value: number;
  recorded_at: string;
}

export function usePortfolioHistory(portfolioId?: string | null, startValue = 10000) {
  const [snapshots, setSnapshots] = useState<PortfolioSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!portfolioId) { setLoading(false); return; }

    async function fetch() {
      const { data } = await supabase
        .from('portfolio_snapshots')
        .select('total_value, recorded_at')
        .eq('portfolio_id', portfolioId)
        .order('recorded_at', { ascending: true });

      setSnapshots(data ?? []);
      setLoading(false);
    }
    fetch();
  }, [portfolioId]);

  const chartPoints = [
    startValue,
    ...snapshots.map(s => Number(s.total_value)),
  ];

  const flatLine = snapshots.length === 0;

  return { snapshots, chartPoints, flatLine, loading };
}
