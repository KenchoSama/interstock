import { useState, useEffect, useCallback } from 'react';
import { STOCKS } from '../data/stocks';

const SYMBOLS = STOCKS.map(s => s.sym);
const REFRESH_MS = 30_000;

export interface QuoteData {
  sym: string;
  price: number;
  chg: number;
  chgPct: number;
}

export function useStockQuotes() {
  const [quotes, setQuotes] = useState<QuoteData[]>(
    STOCKS.map(s => ({ sym: s.sym, price: s.price, chg: s.chg, chgPct: s.chgPct }))
  );
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState(false);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const results = await Promise.all(
        SYMBOLS.map(async sym => {
          const res = await fetch(`/api/chart/${sym}?interval=1d&range=1d`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          const meta = data?.chart?.result?.[0]?.meta;
          if (!meta) throw new Error(`no data for ${sym}`);
          const price: number = meta.regularMarketPrice ?? 0;
          const prevClose: number = meta.chartPreviousClose ?? price;
          const chg = +(price - prevClose).toFixed(2);
          const chgPct = prevClose ? +((chg / prevClose) * 100).toFixed(2) : 0;
          return { sym, price, chg, chgPct };
        })
      );
      setQuotes(results);
      setLastUpdated(new Date());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
    const id = setInterval(fetchQuotes, REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchQuotes]);

  return { quotes, loading, lastUpdated, error, refresh: fetchQuotes };
}
