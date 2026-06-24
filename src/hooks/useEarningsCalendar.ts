import { useEffect, useState } from 'react';

export interface EarningsEvent {
  sym: string;
  date: string;
  est: string;
  actual: string | null;
}

export function useEarningsCalendar(symbols: string[]) {
  const [earnings, setEarnings] = useState<EarningsEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const key = import.meta.env.VITE_FINNHUB_KEY;

        const results = await Promise.all(
          symbols.map(async sym => {
            const res = await fetch(
              `https://finnhub.io/api/v1/stock/earnings?symbol=${sym}&limit=4&token=${key}`
            );
            if (!res.ok) return null;
            const data = await res.json();

            const entry = data?.[0];
            if (!entry) return null;

            return {
              sym,
              date: new Date(entry.period).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              }),
              est: entry.estimate != null
                ? `$${Number(entry.estimate).toFixed(2)}`
                : 'N/A',
              actual: entry.actual != null
                ? `$${Number(entry.actual).toFixed(2)}`
                : null,
            } as EarningsEvent;
          })
        );

        setEarnings(results.filter(Boolean) as EarningsEvent[]);
      } catch {
        setEarnings([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  return { earnings, loading };
}
