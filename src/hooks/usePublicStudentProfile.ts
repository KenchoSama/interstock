import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface PublicMentor {
  name: string;
  title: string;
  company: string;
}

export interface PublicDiploma {
  id: string;
  certType: string;
  awardedAt: string;
}

export interface PublicTrade {
  id: string;
  ticker: string;
  type: string;
  shares: number;
  price: number;
  executedAt: string;
}

export interface PublicHolding {
  sym: string;
  shares: number;
  avg: number;
}

interface UsePublicStudentProfileResult {
  loading: boolean;
  error: string | null;
  name: string | null;
  xp: number;
  schoolName: string | null;
  globalRank: number | null;
  mentor: PublicMentor | null;
  hasCompletedScenario: boolean;
  hasEtfSubmission: boolean;
  diplomas: PublicDiploma[];
  recentTrades: PublicTrade[];
  holdings: PublicHolding[];
  refetch: () => Promise<void>;
}

export function usePublicStudentProfile(studentId: string | undefined): UsePublicStudentProfileResult {
  const [name, setName] = useState<string | null>(null);
  const [xp, setXp] = useState(0);
  const [schoolName, setSchoolName] = useState<string | null>(null);
  const [globalRank, setGlobalRank] = useState<number | null>(null);
  const [mentor, setMentor] = useState<PublicMentor | null>(null);
  const [hasCompletedScenario, setHasCompletedScenario] = useState(false);
  const [hasEtfSubmission, setHasEtfSubmission] = useState(false);
  const [diplomas, setDiplomas] = useState<PublicDiploma[]>([]);
  const [recentTrades, setRecentTrades] = useState<PublicTrade[]>([]);
  const [holdings, setHoldings] = useState<PublicHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const profileRes = await supabase
      .from('profiles')
      .select('full_name, xp, school_id')
      .eq('id', studentId)
      .maybeSingle();

    if (profileRes.error || !profileRes.data) {
      setError(profileRes.error?.message ?? 'Student not found');
      setLoading(false);
      return;
    }

    const schoolId = profileRes.data.school_id;

    const [
      schoolRes,
      leaderboardRes,
      mentorAssignmentRes,
      gameSessionsRes,
      etfRes,
      diplomasRes,
      portfolioRes,
    ] = await Promise.all([
      schoolId
        ? supabase.from('schools').select('name').eq('id', schoolId).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      supabase.from('leaderboard').select('global_rank').eq('id', studentId).maybeSingle(),
      supabase
        .from('mentor_assignments')
        .select('mentor_id, mentors ( name, title, company )')
        .eq('student_id', studentId)
        .maybeSingle(),
      supabase.from('game_sessions').select('id').eq('user_id', studentId).gt('score', 0).limit(1),
      supabase.from('etf_submissions').select('id').eq('user_id', studentId).limit(1),
      supabase.from('diplomas').select('id, cert_type, awarded_at').eq('user_id', studentId).order('awarded_at', { ascending: false }),
      supabase.from('portfolios').select('id').eq('user_id', studentId).maybeSingle(),
    ]);

    setName(profileRes.data.full_name ?? 'Student');
    setXp(profileRes.data.xp ?? 0);
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

    const portfolioId = (portfolioRes.data as any)?.id ?? null;

    if (portfolioId) {
      const [transactionsRes, holdingsRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('id, ticker, type, shares, price, executed_at')
          .eq('portfolio_id', portfolioId)
          .order('executed_at', { ascending: false })
          .limit(5),
        supabase.from('holdings').select('ticker, shares, avg_cost').eq('portfolio_id', portfolioId),
      ]);

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

      setHoldings(
        (holdingsRes.data ?? []).map((h: any) => ({
          sym: h.ticker,
          shares: h.shares,
          avg: h.avg_cost,
        }))
      );
    } else {
      setRecentTrades([]);
      setHoldings([]);
    }

    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    loading,
    error,
    name,
    xp,
    schoolName,
    globalRank,
    mentor,
    hasCompletedScenario,
    hasEtfSubmission,
    diplomas,
    recentTrades,
    holdings,
    refetch: fetchProfile,
  };
}