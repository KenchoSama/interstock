import { useState, useCallback } from 'react';

export interface LookupResult {
  sym: string;
  name: string;
  price: number;
  chg: number;
  chgPct: number;
}

export function useStockLookup() {
  const [result, setResult] = useState<LookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = useCallback(async (ticker: string) => {
    const sym = ticker.trim().toUpperCase();
    if (!sym) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/chart/${sym}?interval=1d&range=1d`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();

      const meta = data?.chart?.result?.[0]?.meta;
      if (!meta) throw new Error('No data');

      const price: number = meta.regularMarketPrice ?? 0;
      const prevClose: number = meta.chartPreviousClose ?? price;
      const chg = +(price - prevClose).toFixed(2);
      const chgPct = prevClose ? +((chg / prevClose) * 100).toFixed(2) : 0;
      const name: string = meta.longName ?? meta.shortName ?? sym;

      setResult({ sym, name, price, chg, chgPct });
    } catch {
      setError(`"${sym}" not found. Check the ticker and try again.`);
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
