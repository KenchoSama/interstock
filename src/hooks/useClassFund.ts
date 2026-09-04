import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface ClassFund {
  id: string;
  name: string;
  code: string;
  startingCash: number;
  cashBalance: number;
}

export interface ClassFundHolding {
  ticker: string;
  shares: number;
  avgCost: number;
}

export interface ClassFundTransaction {
  id: string;
  userId: string | null;
  userName: string;
  ticker: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
  executedAt: string;
}

// Most students are only ever in one class fund at a time, so this hook
// surfaces that one fund rather than a list.
export function useClassFund(userId: string | null) {
  const [fund, setFund] = useState<ClassFund | null>(null);
  const [holdings, setHoldings] = useState<ClassFundHolding[]>([]);
  const [transactions, setTransactions] = useState<ClassFundTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const { data: membership, error: memberError } = await supabase
      .from('class_fund_members')
      .select('class_fund_id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    if (memberError) {
      setError(memberError.message);
      setLoading(false);
      return;
    }

    if (!membership) {
      setFund(null);
      setHoldings([]);
      setTransactions([]);
      setLoading(false);
      return;
    }

    const fundId = membership.class_fund_id;

    const [fundRes, holdingsRes, txRes] = await Promise.all([
      supabase.from('class_funds').select('id, name, code, starting_cash, cash_balance').eq('id', fundId).maybeSingle(),
      supabase.from('class_fund_holdings').select('ticker, shares, avg_cost').eq('class_fund_id', fundId),
      supabase
        .from('class_fund_transactions')
        .select('id, user_id, ticker, type, shares, price, executed_at, profiles ( full_name )')
        .eq('class_fund_id', fundId)
        .order('executed_at', { ascending: false })
        .limit(20),
    ]);

    if (fundRes.error) {
      setError(fundRes.error.message);
      setLoading(false);
      return;
    }

    setFund(fundRes.data ? {
      id: fundRes.data.id,
      name: fundRes.data.name,
      code: fundRes.data.code,
      startingCash: fundRes.data.starting_cash,
      cashBalance: fundRes.data.cash_balance,
    } : null);

    setHoldings((holdingsRes.data ?? []).map((h: any) => ({ ticker: h.ticker, shares: h.shares, avgCost: h.avg_cost })));

    setTransactions((txRes.data ?? []).map((t: any) => ({
      id: t.id,
      userId: t.user_id,
      userName: t.profiles?.full_name ?? 'Student',
      ticker: t.ticker,
      type: t.type,
      shares: t.shares,
      price: t.price,
      executedAt: t.executed_at,
    })));

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function joinFund(code: string): Promise<{ error: string | null }> {
    const { error } = await supabase.rpc('join_class_fund', { p_code: code });
    if (error) return { error: error.message };
    await fetchAll();
    return { error: null };
  }

  async function trade(ticker: string, type: 'buy' | 'sell', shares: number, price: number): Promise<{ error: string | null }> {
    if (!fund) return { error: 'No class fund joined.' };
    const { error } = await supabase.rpc('trade_class_fund', {
      p_fund_id: fund.id,
      p_ticker: ticker,
      p_type: type,
      p_shares: shares,
      p_price: price,
    });
    if (error) return { error: error.message };
    await fetchAll();
    return { error: null };
  }

  return { fund, holdings, transactions, loading, error, joinFund, trade, refetch: fetchAll };
}
