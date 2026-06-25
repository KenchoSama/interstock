import { useEffect, useState } from 'react';

export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  time: number;
}

export function useStockCandles(ticker: string) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!ticker) return;
    setLoading(true);
    setError(false);

    async function fetchCandles() {
      try {
        // Reuse existing Yahoo Finance proxy — already set up in api/chart/[sym].ts
        const res = await fetch(`/api/chart/${ticker}?interval=1d&range=1y`);
        if (!res.ok) throw new Error();
        const data = await res.json();

        const result = data?.chart?.result?.[0];
        if (!result) throw new Error('No data');

        const timestamps: number[] = result.timestamp ?? [];
        const ohlc = result.indicators?.quote?.[0];
        if (!ohlc || timestamps.length === 0) throw new Error('No OHLC');

        const candles: Candle[] = timestamps.map((t: number, i: number) => ({
          open:  ohlc.open[i]  ?? 0,
          high:  ohlc.high[i]  ?? 0,
          low:   ohlc.low[i]   ?? 0,
          close: ohlc.close[i] ?? 0,
          time:  t,
        })).filter(c => c.open > 0); // remove any null candles

        setCandles(candles);
      } catch {
        setError(true);
        setCandles([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCandles();
  }, [ticker]);

  return { candles, loading, error };
}
