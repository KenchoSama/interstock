import { supabase } from './supabase';

export async function persistTrade(
  type: 'buy' | 'sell',
  ticker: string,
  shares: number,
  price: number,
  portfolioId: string,
  newCash: number,
  newPortfolioValue: number,
  userId: string
) {
  if (type === 'buy') {
    const { data: existing } = await supabase
      .from('holdings')
      .select('id, shares, avg_cost')
      .eq('portfolio_id', portfolioId)
      .eq('ticker', ticker)
      .maybeSingle();

    if (existing) {
      const totalShares = existing.shares + shares;
      const newAvg = (existing.avg_cost * existing.shares + price * shares) / totalShares;
      await supabase
        .from('holdings')
        .update({ shares: totalShares, avg_cost: newAvg })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('holdings')
        .insert({ portfolio_id: portfolioId, ticker, shares, avg_cost: price });
    }
  } else {
    const { data: existing } = await supabase
      .from('holdings')
      .select('id, shares')
      .eq('portfolio_id', portfolioId)
      .eq('ticker', ticker)
      .maybeSingle();

    if (existing) {
      if (existing.shares === shares) {
        await supabase.from('holdings').delete().eq('id', existing.id);
      } else {
        await supabase
          .from('holdings')
          .update({ shares: existing.shares - shares })
          .eq('id', existing.id);
      }
    }
  }

  // Update cash balance
  await supabase
    .from('portfolios')
    .update({ cash_balance: newCash })
    .eq('id', portfolioId);

  // Insert transaction snapshot
  await supabase
    .from('transactions')
    .insert({
      portfolio_id: portfolioId,
      ticker,
      type,
      shares,
      price,
      portfolio_value: newPortfolioValue,
    });

  // Increment XP — was previously (incorrectly) keyed off portfolioId instead
  // of the student's own profile id, so it silently matched zero rows.
  await supabase.rpc('increment_xp', { user_id: userId, amount: 10 });
}
