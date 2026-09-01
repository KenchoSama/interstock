import { useEffect, useState } from 'react';

// Every ticker we carry margin/contract-size reference data for (see
// FUTURES_DATA in Futures.tsx) — kept in sync so the contracts table and any
// open position always has a live price, even for contracts not shown by
// default. Root symbols map straight to Yahoo's "<root>=F" convention.
const FUTURES_ROOTS = [
  'CL', 'NG', 'RB', 'HO', 'BZ',
  'GC', 'SI', 'HG', 'PL', 'PA',
  'ZC', 'ZW', 'ZS', 'ZM', 'ZL',
  'KC', 'SB', 'CT', 'CC',
  'LE', 'HE', 'GF',
  'ES', 'NQ', 'YM', 'RTY',
  'ZB', 'ZN',
];

const FUTURES_SYMBOLS = FUTURES_ROOTS.map(ticker => ({ ticker, yahoo: `${ticker}=F` }));

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
