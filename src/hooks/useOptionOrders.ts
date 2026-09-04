import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface OptionOrder {
  id: string;
  ticker: string;
  optionType: 'call' | 'put';
  strike: number;
  expiryDate: string;
  contracts: number;
  limitPrice: number;
  status: 'working' | 'filled' | 'canceled';
  createdAt: string;
  filledAt: string | null;
  filledPrice: number | null;
}

function mapRow(r: any): OptionOrder {
  return {
    id: r.id,
    ticker: r.ticker,
    optionType: r.option_type,
    strike: r.strike,
    expiryDate: r.expiry_date,
    contracts: r.contracts,
    limitPrice: r.limit_price,
    status: r.status,
    createdAt: r.created_at,
    filledAt: r.filled_at,
    filledPrice: r.filled_price,
  };
}

export function useOptionOrders(portfolioId: string | null) {
  const [orders, setOrders] = useState<OptionOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!portfolioId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('option_orders')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('created_at', { ascending: false });

    setOrders((data ?? []).map(mapRow));
    setLoading(false);
  }, [portfolioId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  async function placeOrder(input: {
    ticker: string;
    optionType: 'call' | 'put';
    strike: number;
    expiryDate: string;
    contracts: number;
    limitPrice: number;
  }): Promise<{ error: string | null }> {
    if (!portfolioId) return { error: 'Portfolio not loaded. Please refresh.' };

    const { error } = await supabase.from('option_orders').insert({
      portfolio_id: portfolioId,
      ticker: input.ticker,
      option_type: input.optionType,
      strike: input.strike,
      expiry_date: input.expiryDate,
      contracts: input.contracts,
      limit_price: input.limitPrice,
    });

    if (error) return { error: error.message };
    await fetchOrders();
    return { error: null };
  }

  async function cancelOrder(id: string): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('option_orders')
      .update({ status: 'canceled', canceled_at: new Date().toISOString() })
      .eq('id', id);

    if (error) return { error: error.message };
    await fetchOrders();
    return { error: null };
  }

  async function markFilled(id: string, price: number): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('option_orders')
      .update({ status: 'filled', filled_at: new Date().toISOString(), filled_price: price })
      .eq('id', id);

    if (error) return { error: error.message };
    await fetchOrders();
    return { error: null };
  }

  const workingOrders = orders.filter(o => o.status === 'working');

  return { orders, workingOrders, loading, placeOrder, cancelOrder, markFilled, refetch: fetchOrders };
}
