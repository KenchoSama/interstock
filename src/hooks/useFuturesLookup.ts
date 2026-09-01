import { useState, useCallback } from 'react';

export interface FuturesLookupResult {
  ticker: string;
  name: string;
  price: number;
  chg: number;
  chgPct: number;
}

// Looks up any futures contract by its root ticker (e.g. "SI" for silver),
// not just the ones we have margin/contract-size reference data for.
export function useFuturesLookup() {
  const [result, setResult] = useState<FuturesLookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = useCallback(async (input: string) => {
    const root = input.trim().toUpperCase().replace(/=F$/, '');
    if (!root) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/chart/${root}=F?interval=1d&range=1d`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();

      const meta = data?.chart?.result?.[0]?.meta;
      if (!meta || meta.regularMarketPrice == null) throw new Error('No data');

      const price: number = meta.regularMarketPrice ?? 0;
      const prevClose: number = meta.chartPreviousClose ?? price;
      const chg = +(price - prevClose).toFixed(3);
      const chgPct = prevClose ? +((chg / prevClose) * 100).toFixed(2) : 0;
      const name: string = meta.longName ?? meta.shortName ?? root;

      setResult({ ticker: root, name, price, chg, chgPct });
    } catch {
      setError(`"${root}" not found. Try the root ticker (e.g. "SI" for silver).`);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, loading, error, lookup, clear };
}
