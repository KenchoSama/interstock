import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface AdminClassFund {
  id: string;
  name: string;
  code: string;
  startingCash: number;
  cashBalance: number;
  memberCount: number;
}

export function useAdminClassFunds() {
  const [funds, setFunds] = useState<AdminClassFund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFunds = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [fundsRes, membersRes] = await Promise.all([
      supabase.from('class_funds').select('id, name, code, starting_cash, cash_balance').order('created_at', { ascending: false }),
      supabase.from('class_fund_members').select('class_fund_id'),
    ]);

    if (fundsRes.error) {
      setError(fundsRes.error.message);
      setLoading(false);
      return;
    }

    const memberCounts = new Map<string, number>();
    for (const r of membersRes.data ?? []) {
      memberCounts.set(r.class_fund_id, (memberCounts.get(r.class_fund_id) ?? 0) + 1);
    }

    setFunds(
      (fundsRes.data ?? []).map(f => ({
        id: f.id,
        name: f.name,
        code: f.code,
        startingCash: f.starting_cash,
        cashBalance: f.cash_balance,
        memberCount: memberCounts.get(f.id) ?? 0,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFunds();
  }, [fetchFunds]);

  async function createFund(input: { name: string; code: string; startingCash: number }): Promise<{ error: string | null }> {
    const { error } = await supabase.rpc('create_class_fund', {
      p_name: input.name,
      p_code: input.code,
      p_starting_cash: input.startingCash,
    });
    if (error) return { error: error.message };
    await fetchFunds();
    return { error: null };
  }

  async function deleteFund(id: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from('class_funds').delete().eq('id', id);
    if (error) return { error: error.message };
    await fetchFunds();
    return { error: null };
  }

  return { funds, loading, error, createFund, deleteFund, refetch: fetchFunds };
}
