import { useEffect, useRef, useState } from 'react';
import { TOP_TICKERS, toYahooSymbol } from '../data/sp500';

export interface TickerQuote {
  sym: string;
  price: number;
  chg: number;
  chgPct: number;
}

const CONCURRENCY = 20;
const BATCH_GAP_MS = 150;
const CYCLE_REFRESH_MS = 90_000;

// Fetches quotes for the top-market-cap tickers for the topbar's rotating
// carousel, in small concurrent batches so it doesn't hammer the Yahoo
// Finance proxy or trip rate limiting. Quotes fill in progressively and are
// kept across refresh cycles.
export function useTickerQuotes() {
  const [quotesMap, setQuotesMap] = useState<Record<string, TickerQuote>>({});
  const [loading, setLoading] = useState(true);
  const fetching = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchOne(sym: string) {
      try {
        const res = await fetch(`/api/chart/${toYahooSymbol(sym)}?interval=1d&range=1d`);
        if (!res.ok) return;
        const data = await res.json();
        const meta = data?.chart?.result?.[0]?.meta;
        if (!meta) return;
        const price: number = meta.regularMarketPrice ?? 0;
        const prevClose: number = meta.chartPreviousClose ?? price;
        const chg = +(price - prevClose).toFixed(2);
        const chgPct = prevClose ? +((chg / prevClose) * 100).toFixed(2) : 0;
        if (!cancelled) {
          setQuotesMap(prev => ({ ...prev, [sym]: { sym, price, chg, chgPct } }));
        }
      } catch {
        // skip this symbol this cycle
      }
    }

    async function fetchCycle() {
      if (fetching.current) return;
      fetching.current = true;

      for (let i = 0; i < TOP_TICKERS.length; i += CONCURRENCY) {
        if (cancelled) break;
        const batch = TOP_TICKERS.slice(i, i + CONCURRENCY);
        await Promise.all(batch.map(fetchOne));
        if (!cancelled && i + CONCURRENCY < TOP_TICKERS.length) {
          await new Promise(r => setTimeout(r, BATCH_GAP_MS));
        }
      }

      if (!cancelled) setLoading(false);
      fetching.current = false;
    }

    fetchCycle();
    const id = setInterval(fetchCycle, CYCLE_REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const quotes = TOP_TICKERS.map(sym => quotesMap[sym]).filter((q): q is TickerQuote => q !== undefined);

  return { quotes, loading };
}
