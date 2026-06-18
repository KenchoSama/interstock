import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface PortfolioSnapshot {
  portfolio_value: number;
  executed_at: string;
}

export function usePortfolioHistory(portfolioId?: string | null, startValue = 10000) {
  const [history, setHistory] = useState<PortfolioSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!portfolioId) { setLoading(false); return; }

    async function fetch() {
      const { data } = await supabase
        .from('transactions')
        .select('portfolio_value, executed_at')
        .eq('portfolio_id', portfolioId)
        .order('executed_at', { ascending: true });

      setHistory(data ?? []);
      setLoading(false);
    }
    fetch();
  }, [portfolioId]);

  // Build chart points — start with account open value, then each trade snapshot
  const chartPoints = [
    startValue,
    ...history.map(h => Number(h.portfolio_value)),
  ];

  // If no trades yet, flat line
  const flatLine = chartPoints.length === 1;

  return { history, chartPoints, flatLine, loading };
}
