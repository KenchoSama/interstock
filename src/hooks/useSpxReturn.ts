import { useEffect, useState } from 'react';

export function useSpxReturn() {
  const [spxReturn, setSpxReturn] = useState<number>(14.2); // fallback
  const [spxPoints, setSpxPoints] = useState<number[]>([]);
  const [spxDates, setSpxDates]   = useState<number[]>([]);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await window.fetch('/api/chart/%5EGSPC?interval=1d&range=1y');
        if (!res.ok) return;
        const data = await res.json();
        const result = data?.chart?.result?.[0];
        if (!result) return;

        const closes: number[] = result.indicators?.quote?.[0]?.close ?? [];
        const valid = closes.filter(Boolean);
        if (valid.length < 2) return;

        const first = valid[0];
        const last = valid[valid.length - 1];
        const ytd = +((( last - first) / first) * 100).toFixed(1);

        setSpxReturn(ytd);
        setSpxPoints(valid);
        setSpxDates(result.timestamp ?? []);
      } catch { /* keep fallback */ }
    }
    fetch();
  }, []);

  return { spxReturn, spxPoints, spxDates };
}
