import { useEffect, useState } from 'react';

export interface StockFundamentals {
  pe: number | null;
  eps: number | null;
  beta: number | null;
  mktCap: string | null;
  weekHigh52: number | null;
  weekLow52: number | null;
  div: number | null;
  vol: number | null;
  roe: number | null;
  debtToEquity: number | null;
  evEbitda: number | null;
  bookValuePerShare: number | null;
}

export function useStockFundamentals(ticker: string) {
  const [fundamentals, setFundamentals] = useState<StockFundamentals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!ticker) return;
    setLoading(true);
    setError(false);

    async function fetchFundamentals() {
      try {
        const key = import.meta.env.VITE_FINNHUB_KEY;

        const [metricRes, profileRes] = await Promise.all([
          fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${ticker}&metric=all&token=${key}`),
          fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${key}`),
        ]);

        if (!metricRes.ok || !profileRes.ok) throw new Error();

        const metricData = await metricRes.json();
        const profileData = await profileRes.json();

        const m = metricData?.metric ?? {};
        const capInMillions = profileData?.marketCapitalization;
        const mktCap = capInMillions
          ? capInMillions >= 1_000_000
            ? `$${(capInMillions / 1_000_000).toFixed(1)}T`
            : capInMillions >= 1_000
            ? `$${(capInMillions / 1_000).toFixed(0)}B`
            : `$${capInMillions.toFixed(0)}M`
          : null;

        setFundamentals({
          pe: m['peNormalizedAnnual'] ?? m['peTTM'] ?? null,
          eps: m['epsTTM'] ?? m['epsNormalizedAnnual'] ?? null,
          beta: m['beta'] ?? null,
          mktCap,
          weekHigh52: m['52WeekHigh'] ?? null,
          weekLow52: m['52WeekLow'] ?? null,
          div: m['dividendPerShareAnnual'] ?? null,
          vol: m['10DayAverageTradingVolume'] ?? null,
          roe: m['roeRfy'] ?? null,
          debtToEquity: m['totalDebt/totalEquityAnnual'] ?? null,
          evEbitda: m['ev/ebitdaTTM'] ?? m['ev/ebitda'] ?? null,
          bookValuePerShare: m['bookValuePerShareAnnual'] ?? null,
        });
      } catch {
        setError(true);
        setFundamentals(null);
      } finally {
        setLoading(false);
      }
    }

    fetchFundamentals();
  }, [ticker]);

  return { fundamentals, loading, error };
}
