import { useState, useEffect, useCallback } from 'react';
import { STOCKS } from '../data/stocks';

const SYMBOLS = STOCKS.map(s => s.sym).join(',');
const REFRESH_MS = 30_000;

export interface QuoteData {
  sym: string;
  price: number;
  chg: number;
  chgPct: number;
}

interface YahooQuote {
  symbol: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
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
      const res = await fetch(
        `/api/quotes?symbols=${SYMBOLS}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const results: YahooQuote[] = data?.quoteResponse?.result ?? [];
      if (!results.length) throw new Error('empty response');

      setQuotes(
        results.map(r => ({
          sym: r.symbol,
          price: r.regularMarketPrice ?? 0,
          chg: r.regularMarketChange ?? 0,
          chgPct: r.regularMarketChangePercent ?? 0,
        }))
      );
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
