import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface OptionPosition {
  id: string;
  ticker: string;
  optionType: 'call' | 'put';
  strike: number;
  contracts: number;
  premiumPaid: number;
  openedAt: string;
  expiryDate: string;
  status: 'open' | 'closed';
  closeValue: number | null;
  closedAt: string | null;
}

function mapRow(r: any): OptionPosition {
  return {
    id: r.id,
    ticker: r.ticker,
    optionType: r.option_type,
    strike: r.strike,
    contracts: r.contracts,
    premiumPaid: r.premium_paid,
    openedAt: r.opened_at,
    expiryDate: r.expiry_date,
    status: r.status,
    closeValue: r.close_value,
    closedAt: r.closed_at,
  };
}

export function useOptionPositions(portfolioId: string | null) {
  const [positions, setPositions] = useState<OptionPosition[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPositions = useCallback(async () => {
    if (!portfolioId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('option_positions')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('opened_at', { ascending: false });

    setPositions((data ?? []).map(mapRow));
    setLoading(false);
  }, [portfolioId]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  async function openPosition(input: {
    ticker: string;
    optionType: 'call' | 'put';
    strike: number;
    contracts: number;
    premium: number;
    expiryDays: number;
  }): Promise<{ error: string | null }> {
    if (!portfolioId) return { error: 'Portfolio not loaded. Please refresh.' };

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + input.expiryDays);

    const { error } = await supabase.from('option_positions').insert({
      portfolio_id: portfolioId,
      ticker: input.ticker,
      option_type: input.optionType,
      strike: input.strike,
      contracts: input.contracts,
      premium_paid: input.premium,
      expiry_date: expiry.toISOString().slice(0, 10),
    });

    if (error) return { error: error.message };

    await fetchPositions();
    return { error: null };
  }

  async function closePosition(positionId: string, exitValue: number): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('option_positions')
      .update({ status: 'closed', close_value: exitValue, closed_at: new Date().toISOString() })
      .eq('id', positionId);

    if (error) return { error: error.message };

    await fetchPositions();
    return { error: null };
  }

  return { positions, loading, openPosition, closePosition, refetch: fetchPositions };
}
