import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { STOCKS } from '../data/stocks';

export interface TournamentStudentEntry {
  userId: string;
  name: string;
  schoolId: string | null;
  schoolName: string;
  rank: number;
  totalValue: number;
  returnPct: number;
}

export interface TournamentSchoolEntry {
  schoolId: string;
  schoolName: string;
  rank: number;
  studentCount: number;
  avgReturnPct: number;
}

// Computed entirely client-side from live quotes, the same way Portfolio.tsx/
// Dashboard.tsx/useSchoolLeaderboard.ts already compute performance — avoids
// depending on the general `leaderboard` view, which is keyed 1:1 by user and
// isn't tournament-aware.
export function useTournamentLeaderboard(competitionId: string | null) {
  const [students, setStudents] = useState<TournamentStudentEntry[]>([]);
  const [schools, setSchools] = useState<TournamentSchoolEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!competitionId) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function fetchLeaderboard() {
      setLoading(true);
      setError(null);

      const { data: portfolioRows, error: pErr } = await supabase
        .from('portfolios')
        .select('id, cash_balance, initial_balance, user_id, profiles ( full_name, school_id, schools ( name ) )')
        .eq('competition_id', competitionId);

      if (pErr) {
        if (!cancelled) {
          setError(pErr.message);
          setLoading(false);
        }
        return;
      }

      const rows = portfolioRows ?? [];
      const portfolioIds = rows.map((r: any) => r.id);

      const { data: holdingsRows } = portfolioIds.length > 0
        ? await supabase.from('holdings').select('portfolio_id, ticker, shares, avg_cost').in('portfolio_id', portfolioIds)
        : { data: [] };

      // Live prices for tickers held in this tournament — fall back to avg_cost
      // (0% return contribution) for anything we can't price live, same
      // fallback pattern used elsewhere in the app.
      const tickers = Array.from(new Set((holdingsRows ?? []).map(h => h.ticker)));
      const priceMap = new Map<string, number>();
      await Promise.all(
        tickers.map(async ticker => {
          const stockPrice = STOCKS.find(s => s.sym === ticker)?.price;
          if (stockPrice) {
            priceMap.set(ticker, stockPrice);
            return;
          }
          try {
            const res = await fetch(`/api/chart/${ticker}?interval=1d&range=1d`);
            if (!res.ok) return;
            const data = await res.json();
            const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
            if (price) priceMap.set(ticker, price);
          } catch { /* ignore, falls back to avg_cost below */ }
        })
      );

      if (cancelled) return;

      const holdingsByPortfolio = new Map<string, { ticker: string; shares: number; avg_cost: number }[]>();
      for (const h of holdingsRows ?? []) {
        const list = holdingsByPortfolio.get(h.portfolio_id) ?? [];
        list.push(h);
        holdingsByPortfolio.set(h.portfolio_id, list);
      }

      const studentEntries: TournamentStudentEntry[] = rows.map((r: any) => {
        const holdings = holdingsByPortfolio.get(r.id) ?? [];
        const holdingsValue = holdings.reduce((sum, h) => sum + h.shares * (priceMap.get(h.ticker) ?? h.avg_cost), 0);
        const totalValue = (r.cash_balance ?? 0) + holdingsValue;
        const startingCash = r.initial_balance ?? r.cash_balance ?? 10000;
        const returnPct = startingCash > 0 ? ((totalValue - startingCash) / startingCash) * 100 : 0;
        return {
          userId: r.user_id,
          name: r.profiles?.full_name ?? 'Student',
          schoolId: r.profiles?.school_id ?? null,
          schoolName: r.profiles?.schools?.name ?? 'Unknown School',
          totalValue,
          returnPct,
          rank: 0,
        };
      });

      studentEntries.sort((a, b) => b.returnPct - a.returnPct);
      studentEntries.forEach((s, i) => { s.rank = i + 1; });

      const schoolGroups = new Map<string, { schoolName: string; sum: number; count: number }>();
      for (const s of studentEntries) {
        if (!s.schoolId) continue;
        const g = schoolGroups.get(s.schoolId) ?? { schoolName: s.schoolName, sum: 0, count: 0 };
        g.sum += s.returnPct;
        g.count += 1;
        schoolGroups.set(s.schoolId, g);
      }
      const schoolEntries: TournamentSchoolEntry[] = Array.from(schoolGroups.entries())
        .map(([schoolId, g]) => ({ schoolId, schoolName: g.schoolName, studentCount: g.count, avgReturnPct: g.sum / g.count, rank: 0 }))
        .sort((a, b) => b.avgReturnPct - a.avgReturnPct)
        .map((s, i) => ({ ...s, rank: i + 1 }));

      if (!cancelled) {
        setStudents(studentEntries);
        setSchools(schoolEntries);
        setLoading(false);
      }
    }

    fetchLeaderboard();
    return () => { cancelled = true; };
  }, [competitionId]);

  return { students, schools, loading, error };
}
