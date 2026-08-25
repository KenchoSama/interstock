import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface LimitOrder {
  id: string;
  ticker: string;
  side: 'buy' | 'sell';
  shares: number;
  limitPrice: number;
  status: 'working' | 'filled' | 'canceled';
  createdAt: string;
  filledAt: string | null;
  filledPrice: number | null;
}

export interface FilledTrade {
  id: string;
  ticker: string;
  side: 'buy' | 'sell';
  shares: number;
  price: number;
  orderType: 'market' | 'limit';
  executedAt: string;
}

function mapOrderRow(r: any): LimitOrder {
  return {
    id: r.id,
    ticker: r.ticker,
    side: r.side,
    shares: r.shares,
    limitPrice: r.limit_price,
    status: r.status,
    createdAt: r.created_at,
    filledAt: r.filled_at,
    filledPrice: r.filled_price,
  };
}

export function useOrderHistory(portfolioId: string | null) {
  const [workingOrders, setWorkingOrders] = useState<LimitOrder[]>([]);
  const [canceledOrders, setCanceledOrders] = useState<LimitOrder[]>([]);
  const [filledTrades, setFilledTrades] = useState<FilledTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!portfolioId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const [ordersRes, txRes] = await Promise.all([
      supabase.from('limit_orders').select('*').eq('portfolio_id', portfolioId).order('created_at', { ascending: false }),
      supabase.from('transactions').select('id, ticker, type, shares, price, executed_at').eq('portfolio_id', portfolioId).order('executed_at', { ascending: false }),
    ]);

    if (ordersRes.error || txRes.error) {
      setError(ordersRes.error?.message ?? txRes.error?.message ?? 'Failed to load orders.');
      setLoading(false);
      return;
    }

    const orders = (ordersRes.data ?? []).map(mapOrderRow);
    setWorkingOrders(orders.filter(o => o.status === 'working'));
    setCanceledOrders(orders.filter(o => o.status !== 'working'));

    setFilledTrades(
      (txRes.data ?? []).map((t: any) => ({
        id: t.id,
        ticker: t.ticker,
        side: t.type,
        shares: t.shares,
        price: t.price,
        orderType: 'market' as const,
        executedAt: t.executed_at,
      }))
    );

    setLoading(false);
  }, [portfolioId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  async function placeLimitOrder(input: {
    ticker: string;
    side: 'buy' | 'sell';
    shares: number;
    limitPrice: number;
  }): Promise<{ error: string | null }> {
    if (!portfolioId) return { error: 'Portfolio not loaded. Please refresh.' };

    const { error } = await supabase.from('limit_orders').insert({
      portfolio_id: portfolioId,
      ticker: input.ticker,
      side: input.side,
      shares: input.shares,
      limit_price: input.limitPrice,
    });

    if (error) return { error: error.message };

    await fetchOrders();
    return { error: null };
  }

  async function cancelOrder(orderId: string): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('limit_orders')
      .update({ status: 'canceled', canceled_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) return { error: error.message };

    await fetchOrders();
    return { error: null };
  }

  async function markFilled(orderId: string, fillPrice: number): Promise<void> {
    await supabase
      .from('limit_orders')
      .update({ status: 'filled', filled_at: new Date().toISOString(), filled_price: fillPrice })
      .eq('id', orderId);
    await fetchOrders();
  }

  return {
    workingOrders,
    canceledOrders,
    filledTrades,
    loading,
    error,
    placeLimitOrder,
    cancelOrder,
    markFilled,
    refetch: fetchOrders,
  };
}
