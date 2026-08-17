import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface PortfolioSnapshot {
  total_value: number;
  recorded_at: string;
}

export function usePortfolioHistory(
  portfolioId?: string | null,
  startValue = 10000,
  timeframe = '1W'
) {
  const [snapshots, setSnapshots] = useState<PortfolioSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!portfolioId) { setLoading(false); return; }

    async function fetch() {
      const now = new Date();
      let fromDate: Date;
      let interval: string;

      switch (timeframe) {
        case '1H':
          fromDate = new Date(now.getTime() - 60 * 60 * 1000);
          interval = '5min';
          break;
        case '1D':
          fromDate = new Date(now);
          fromDate.setHours(0, 0, 0, 0);
          interval = '5min';
          break;
        case '1W':
          fromDate = new Date(now);
          fromDate.setDate(now.getDate() - 7);
          interval = '5min';
          break;
        case '1M':
          fromDate = new Date(now);
          fromDate.setMonth(now.getMonth() - 1);
          interval = 'daily';
          break;
        case '6M':
          fromDate = new Date(now);
          fromDate.setMonth(now.getMonth() - 6);
          interval = 'daily';
          break;
        case 'YTD':
          fromDate = new Date(now.getFullYear(), 0, 1);
          interval = 'daily';
          break;
        case '1Y':
          fromDate = new Date(now);
          fromDate.setFullYear(now.getFullYear() - 1);
          interval = 'daily';
          break;
        default:
          fromDate = new Date(now);
          fromDate.setDate(now.getDate() - 7);
          interval = '5min';
      }

      const { data } = await supabase
        .from('portfolio_snapshots')
        .select('total_value, recorded_at')
        .eq('portfolio_id', portfolioId)
        .eq('interval', interval)
        .gte('recorded_at', fromDate.toISOString())
        .order('recorded_at', { ascending: true });

      setSnapshots(data ?? []);
      setLoading(false);
    }

    fetch();
  }, [portfolioId, timeframe]);

  const chartPoints = [
    startValue,
    ...snapshots.map(s => Number(s.total_value)),
  ];

  const flatLine = snapshots.length === 0;

  return { snapshots, chartPoints, flatLine, loading };
}
