import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../state/AppContext';

export interface ProfileMentor {
  name: string;
  title: string;
  company: string;
}

export interface ProfileDiploma {
  id: string;
  certType: string;
  awardedAt: string;
}

export interface RecentTrade {
  id: string;
  ticker: string;
  type: string;
  shares: number;
  price: number;
  executedAt: string;
}

interface UseProfileDataResult {
  loading: boolean;
  error: string | null;
  schoolName: string | null;
  globalRank: number | null;
  mentor: ProfileMentor | null;
  hasCompletedScenario: boolean;
  hasEtfSubmission: boolean;
  diplomas: ProfileDiploma[];
  recentTrades: RecentTrade[];
  tradeCount: number;
  refetch: () => Promise<void>;
}

export function useProfileData(): UseProfileDataResult {
  const { state } = useApp();
  const user = state.u[state.role];
  const userId = user.supabaseId;

  const [schoolName, setSchoolName] = useState<string | null>(null);
  const [globalRank, setGlobalRank] = useState<number | null>(null);
  const [mentor, setMentor] = useState<ProfileMentor | null>(null);
  const [hasCompletedScenario, setHasCompletedScenario] = useState(false);
  const [hasEtfSubmission, setHasEtfSubmission] = useState(false);
  const [diplomas, setDiplomas] = useState<ProfileDiploma[]>([]);
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([]);
  const [tradeCount, setTradeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const [
      schoolRes,
      leaderboardRes,
      mentorAssignmentRes,
      gameSessionsRes,
      etfRes,
      diplomasRes,
      transactionsRes,
      tradeCountRes,
    ] = await Promise.all([
      user.school_id
        ? supabase.from('schools').select('name').eq('id', user.school_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      supabase.from('leaderboard').select('global_rank').eq('id', userId).maybeSingle(),
      supabase
        .from('mentor_assignments')
        .select('mentor_id, mentors ( name, title, company )')
        .eq('student_id', userId)
        .maybeSingle(),
      supabase.from('game_sessions').select('id').eq('user_id', userId).gt('score', 0).limit(1),
      supabase.from('etf_submissions').select('id').eq('user_id', userId).limit(1),
      supabase.from('diplomas').select('id, cert_type, awarded_at').eq('user_id', userId).order('awarded_at', { ascending: false }),
      user.portfolioId
        ? supabase
            .from('transactions')
            .select('id, ticker, type, shares, price, executed_at')
            .eq('portfolio_id', user.portfolioId)
            .order('executed_at', { ascending: false })
            .limit(5)
        : Promise.resolve({ data: [], error: null }),
      user.portfolioId
        ? supabase
            .from('transactions')
            .select('id', { count: 'exact', head: true })
            .eq('portfolio_id', user.portfolioId)
        : Promise.resolve({ count: 0, error: null }),
    ]);

    const firstError =
      schoolRes.error ??
      leaderboardRes.error ??
      mentorAssignmentRes.error ??
      gameSessionsRes.error ??
      etfRes.error ??
      diplomasRes.error ??
      transactionsRes.error ??
      tradeCountRes.error;

    if (firstError) {
      setError(firstError.message);
      setLoading(false);
      return;
    }

    setSchoolName((schoolRes.data as any)?.name ?? null);
    setGlobalRank((leaderboardRes.data as any)?.global_rank ?? null);

    const mentorRow: any = mentorAssignmentRes.data;
    setMentor(
      mentorRow?.mentors
        ? { name: mentorRow.mentors.name, title: mentorRow.mentors.title, company: mentorRow.mentors.company }
        : null
    );

    setHasCompletedScenario((gameSessionsRes.data ?? []).length > 0);
    setHasEtfSubmission((etfRes.data ?? []).length > 0);
    setDiplomas(
      (diplomasRes.data ?? []).map((d: any) => ({
        id: d.id,
        certType: d.cert_type,
        awardedAt: d.awarded_at,
      }))
    );

    setRecentTrades(
      (transactionsRes.data ?? []).map((t: any) => ({
        id: t.id,
        ticker: t.ticker,
        type: t.type,
        shares: t.shares,
        price: t.price,
        executedAt: t.executed_at,
      }))
    );
    setTradeCount(tradeCountRes.count ?? 0);

    setLoading(false);
  }, [userId, user.school_id, user.portfolioId]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  return {
    loading,
    error,
    schoolName,
    globalRank,
    mentor,
    hasCompletedScenario,
    hasEtfSubmission,
    diplomas,
    recentTrades,
    tradeCount,
    refetch: fetchProfileData,
  };
}