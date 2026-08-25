import { useEffect, useState } from 'react';

export interface IndexDef {
  key: string;
  label: string;
  ticker: string;
  color: string;
}

// Russell 2000 is the standard small-cap benchmark (commonly requested as
// "Russell 2000"); Yahoo ticker ^RUT.
export const KEY_INDEXES: IndexDef[] = [
  { key: 'sp500', label: 'S&P 500', ticker: '^GSPC', color: '#4d9fff' },
  { key: 'nasdaq100', label: 'Nasdaq 100', ticker: '^NDX', color: '#a855f7' },
  { key: 'dow', label: 'Dow Jones Ind. Avg', ticker: '^DJI', color: '#f9c74f' },
  { key: 'russell2000', label: 'Russell 2000', ticker: '^RUT', color: '#f97316' },
];

export interface IndexSeries {
  key: string;
  values: number[];
  pct: number;
}

function paramsForTimeframe(tf: string): { range: string; interval: string } {
  switch (tf) {
    case '1D': return { range: '1d', interval: '5m' };
    case '1W': return { range: '5d', interval: '15m' };
    case '1M': return { range: '1mo', interval: '1d' };
    case '6M': return { range: '6mo', interval: '1d' };
    case 'YTD': return { range: 'ytd', interval: '1d' };
    case '1Y': return { range: '1y', interval: '1d' };
    default: return { range: '1mo', interval: '1d' };
  }
}

export function useIndexPerformance(keys: string[], timeframe: string) {
  const [series, setSeries] = useState<Record<string, IndexSeries>>({});
  const [loading, setLoading] = useState(false);

  const keysSignature = keys.join(',');

  useEffect(() => {
    if (keys.length === 0) {
      setSeries({});
      return;
    }

    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      const { range, interval } = paramsForTimeframe(timeframe);

      const results = await Promise.all(
        keys.map(async (key): Promise<IndexSeries | null> => {
          const def = KEY_INDEXES.find(i => i.key === key);
          if (!def) return null;
          try {
            const res = await fetch(`/api/chart/${encodeURIComponent(def.ticker)}?interval=${interval}&range=${range}`);
            if (!res.ok) return null;
            const data = await res.json();
            const result = data?.chart?.result?.[0];
            const closes: (number | null)[] = result?.indicators?.quote?.[0]?.close ?? [];
            const values = closes.filter((c): c is number => c !== null && c !== undefined);
            if (values.length < 2) return null;
            const pct = ((values[values.length - 1] - values[0]) / values[0]) * 100;
            return { key, values, pct };
          } catch {
            return null;
          }
        })
      );

      if (cancelled) return;
      const map: Record<string, IndexSeries> = {};
      for (const r of results) if (r) map[r.key] = r;
      setSeries(map);
      setLoading(false);
    }

    fetchAll();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keysSignature, timeframe]);

  return { series, loading };
}
