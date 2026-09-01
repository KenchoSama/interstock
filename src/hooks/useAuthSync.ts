import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../state/AppContext';
import type { Role } from '../types';
import { CURRENT_COC_VERSION } from '../pages/CodeOfConduct';
import { syncLoginStreak } from '../lib/loginStreak';

export function useAuthSync() {
  const { dispatch } = useApp();

  useEffect(() => {
    // If this page load came from a password-recovery email link, go straight to
    // the reset-password screen and skip normal session restoration entirely —
    // otherwise getSession() below can race ahead and log the user in normally
    // before the recovery flow has a chance to take over.
    const url = new URL(window.location.href);
    const isRecovery =
      window.location.hash.includes('type=recovery') || url.searchParams.get('type') === 'recovery';

    if (isRecovery) {
      dispatch({ type: 'SHOW_RESET_PASSWORD' });
    } else {
      // Restore session on page load
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (!session?.user) return;
        await hydrateUser(session.user.id, dispatch);
      });
    }

    // React to login / logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          dispatch({ type: 'SHOW_RESET_PASSWORD' });
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'LOGOUT' });
        } else if (!isRecovery && session?.user) {
          await hydrateUser(session.user.id, dispatch);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [dispatch]);
}

export async function hydrateUser(userId: string, dispatch: React.Dispatch<any>) {
  // 1. Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, xp, created_at, school_id, grade, age, avatar_url, linkedin_url, bio, is_private, last_active_date, login_streak')
    .eq('id', userId)
    .single();

  if (!profile) return;

  if (profile.role !== 'student') {
    dispatch({
      type: 'LOGIN',
      role: profile.role as Role,
      basicData: {
        name: profile.full_name ?? profile.role,
        supabaseId: userId,
        school_id: profile.school_id ?? null,
      },
    });
    return;
  }

  // 2. Fetch the general portfolio (cash balance) — competition_id is null.
  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('id, cash_balance')
    .eq('user_id', userId)
    .is('competition_id', null)
    .single();

  // 3. Fetch holdings (joined with portfolio)
  const holdings = portfolio ? await supabase
    .from('holdings')
    .select('ticker, shares, avg_cost')
    .eq('portfolio_id', portfolio.id)
    .then(({ data }) => data ?? []) : [];

  // 3b. Fetch any tournament portfolios (one per competition this student's
  // school has entered), each with their own holdings.
  const { data: tournamentPortfolioRows } = await supabase
    .from('portfolios')
    .select('id, cash_balance, competition_id, competitions ( name, status )')
    .eq('user_id', userId)
    .not('competition_id', 'is', null);

  const tournamentPortfolios = await Promise.all(
    (tournamentPortfolioRows ?? []).map(async (row: any) => {
      const { data: tHoldings } = await supabase
        .from('holdings')
        .select('ticker, shares, avg_cost')
        .eq('portfolio_id', row.id);

      return {
        competitionId: row.competition_id as string,
        competitionName: row.competitions?.name ?? 'Tournament',
        status: row.competitions?.status ?? 'active',
        id: row.id as string,
        cash: row.cash_balance ?? 0,
        holdings: (tHoldings ?? []).map(h => ({
          sym: h.ticker,
          shares: h.shares,
          avg: h.avg_cost,
          price: h.avg_cost,
        })),
      };
    })
  );

  // 4. Check if student has completed assessment
  const { data: assessment } = await supabase
    .from('assessments')
    .select('id')
    .eq('student_id', userId)
    .maybeSingle();
  const hasAssessment = !!assessment;

  // 5. Check if student has agreed to the current version of the code of conduct
  const { data: cocAgreements } = await supabase
    .from('code_of_conduct_agreements')
    .select('id')
    .eq('student_id', userId)
    .eq('version', CURRENT_COC_VERSION)
    .limit(1);
  const hasAgreedToCoC = (cocAgreements?.length ?? 0) > 0;

  // 6. Update today's login streak (no-op if already recorded today)
  const loginStreak = await syncLoginStreak(userId, profile.last_active_date, profile.login_streak ?? 0);

  dispatch({
    type: 'LOGIN',
    role: 'student',
    studentData: {
      name: profile.full_name ?? 'Student',
      xp: profile.xp ?? 0,
      cash: portfolio?.cash_balance ?? 10000,
      achievements: [],
      createdAt: profile.created_at,
      supabaseId: userId,
      portfolioId: portfolio?.id ?? null,
      hasAssessment,
      hasAgreedToCoC,
      school_id: profile.school_id ?? null,
      grade: profile.grade ?? null,
      age: profile.age ?? null,
      avatarUrl: profile.avatar_url ?? null,
      linkedinUrl: profile.linkedin_url ?? null,
      bio: profile.bio ?? null,
      isPrivate: profile.is_private ?? false,
      loginStreak,
      portfolio: holdings.map(h => ({
        sym: h.ticker,
        shares: h.shares,
        avg: h.avg_cost,
        price: h.avg_cost,
      })),
      tournamentPortfolios,
    },
  });
}