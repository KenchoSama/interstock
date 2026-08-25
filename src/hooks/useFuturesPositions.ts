import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface FuturesPosition {
  id: string;
  ticker: string;
  side: 'long' | 'short';
  contracts: number;
  entryPrice: number;
  multiplier: number;
  marginPosted: number;
  openedAt: string;
  status: 'open' | 'closed';
  closePrice: number | null;
  closeValue: number | null;
  closedAt: string | null;
}

function mapRow(r: any): FuturesPosition {
  return {
    id: r.id,
    ticker: r.ticker,
    side: r.side,
    contracts: r.contracts,
    entryPrice: r.entry_price,
    multiplier: r.multiplier,
    marginPosted: r.margin_posted,
    openedAt: r.opened_at,
    status: r.status,
    closePrice: r.close_price,
    closeValue: r.close_value,
    closedAt: r.closed_at,
  };
}

export function useFuturesPositions(portfolioId: string | null) {
  const [positions, setPositions] = useState<FuturesPosition[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPositions = useCallback(async () => {
    if (!portfolioId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('futures_positions')
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
    side: 'long' | 'short';
    contracts: number;
    entryPrice: number;
    multiplier: number;
    marginPosted: number;
  }): Promise<{ error: string | null }> {
    if (!portfolioId) return { error: 'Portfolio not loaded. Please refresh.' };

    const { error } = await supabase.from('futures_positions').insert({
      portfolio_id: portfolioId,
      ticker: input.ticker,
      side: input.side,
      contracts: input.contracts,
      entry_price: input.entryPrice,
      multiplier: input.multiplier,
      margin_posted: input.marginPosted,
    });

    if (error) return { error: error.message };

    await fetchPositions();
    return { error: null };
  }

  async function closePosition(
    positionId: string,
    closePrice: number,
    closeValue: number
  ): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('futures_positions')
      .update({ status: 'closed', close_price: closePrice, close_value: closeValue, closed_at: new Date().toISOString() })
      .eq('id', positionId);

    if (error) return { error: error.message };

    await fetchPositions();
    return { error: null };
  }

  return { positions, loading, openPosition, closePosition, refetch: fetchPositions };
}
