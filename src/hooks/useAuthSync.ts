import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../state/AppContext';
import type { Role } from '../types';

export function useAuthSync() {
  const { dispatch } = useApp();

  useEffect(() => {
    // Restore session on page load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return;
      await hydrateUser(session.user.id, dispatch);
    });

    // React to login / logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          dispatch({ type: 'LOGOUT' });
        } else if (session?.user) {
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
    .select('role, full_name, xp, created_at, school_id, grade, age')
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
      },
    });
    return;
  }

  // 2. Fetch portfolio (cash balance)
  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('id, cash_balance')
    .eq('user_id', userId)
    .single();

  // 3. Fetch holdings (joined with portfolio)
  const holdings = portfolio ? await supabase
    .from('holdings')
    .select('ticker, shares, avg_cost')
    .eq('portfolio_id', portfolio.id)
    .then(({ data }) => data ?? []) : [];

  // 4. Check if student has completed assessment
  const { data: assessment } = await supabase
    .from('assessments')
    .select('id')
    .eq('student_id', userId)
    .maybeSingle();
  const hasAssessment = !!assessment;

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
      school_id: profile.school_id ?? null,
      grade: profile.grade ?? null,
      age: profile.age ?? null,
      portfolio: holdings.map(h => ({
        sym: h.ticker,
        shares: h.shares,
        avg: h.avg_cost,
        price: h.avg_cost,
      })),
    },
  });
}