import { useEffect, useState } from 'react';

export interface NewsItem {
  title: string;
  source: string;
  sourceUrl: string;
  time: string;
  url: string;
  summary: string;
}

export function useStockNews(ticker: string) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!ticker) return;
    setLoading(true);
    setError(false);

    async function fetchNews() {
      try {
        const key = import.meta.env.VITE_FINNHUB_KEY;
        console.log('Finnhub key:', key);
        const to = new Date().toISOString().split('T')[0];
        const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0];

        const res = await fetch(
          `https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${from}&to=${to}&token=${key}`
        );
        if (!res.ok) throw new Error();
        const data = await res.json();

        const items: NewsItem[] = data.slice(0, 3).map((n: any) => ({
          title: n.headline,
          source: n.source,
          sourceUrl: `https://${n.source.toLowerCase().replace(/\s+/g, '')}.com`,
          summary: n.summary?.slice(0, 120) + '...',
          url: n.url,
          time: formatTime(n.datetime),
        }));

        setNews(items);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, [ticker]);

  return { news, loading, error };
}

function formatTime(unix: number): string {
  const diff = Math.floor((Date.now() - unix * 1000) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
