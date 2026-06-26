import { useEffect, useState } from 'react';

const FUTURES_SYMBOLS = [
  { ticker: 'CL', yahoo: 'CL=F' },
  { ticker: 'GC', yahoo: 'GC=F' },
  { ticker: 'ES', yahoo: 'ES=F' },
  { ticker: 'ZC', yahoo: 'ZC=F' },
  { ticker: 'NG', yahoo: 'NG=F' },
];

export interface FuturesQuote {
  ticker: string;
  price: number;
  chg: number;
  chgPct: number;
}

export function useFuturesQuotes() {
  const [quotes, setQuotes] = useState<FuturesQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      try {
        const results = await Promise.all(
          FUTURES_SYMBOLS.map(async ({ ticker, yahoo }) => {
            const res = await fetch(`/api/chart/${yahoo}?interval=1d&range=1d`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            const meta = data?.chart?.result?.[0]?.meta;
            if (!meta) throw new Error();
            const price: number = meta.regularMarketPrice ?? 0;
            const prevClose: number = meta.chartPreviousClose ?? price;
            const chg = +(price - prevClose).toFixed(3);
            const chgPct = prevClose ? +((chg / prevClose) * 100).toFixed(2) : 0;
            return { ticker, price, chg, chgPct };
          })
        );
        setQuotes(results);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  return { quotes, loading, error };
}
