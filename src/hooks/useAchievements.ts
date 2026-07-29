import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../state/AppContext';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria_type: string;
  criteria_value: number | null;
  earned: boolean;
  earnedAt: string | null;
}

interface UseAchievementsResult {
  badges: Badge[];
  loading: boolean;
  error: string | null;
  earnedCount: number;
  refetch: () => Promise<void>;
}

export function useAchievements(): UseAchievementsResult {
  const { state } = useApp();
  const userId = state.u[state.role].supabaseId;

  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievements = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Re-check eligibility server-side and award anything newly earned.
    const { error: rpcError } = await supabase.rpc('check_and_award_badges', {
      p_user_id: userId,
    });

    if (rpcError) {
      setError(rpcError.message);
      setLoading(false);
      return;
    }

    const [{ data: allBadges, error: badgesErr }, { data: earned, error: earnedErr }] = await Promise.all([
      supabase.from('badges').select('*').eq('active', true).order('name'),
      supabase.from('user_badges').select('badge_id, earned_at').eq('user_id', userId),
    ]);

    if (badgesErr || earnedErr) {
      setError(badgesErr?.message ?? earnedErr?.message ?? 'Failed to load achievements');
      setLoading(false);
      return;
    }

    const earnedMap = new Map((earned ?? []).map((e: any) => [e.badge_id, e.earned_at]));

    const merged: Badge[] = (allBadges ?? []).map((b: any) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      icon: b.icon,
      criteria_type: b.criteria_type,
      criteria_value: b.criteria_value,
      earned: earnedMap.has(b.id),
      earnedAt: earnedMap.get(b.id) ?? null,
    }));

    setBadges(merged);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const earnedCount = badges.filter(b => b.earned).length;

  return { badges, loading, error, earnedCount, refetch: fetchAchievements };
}
