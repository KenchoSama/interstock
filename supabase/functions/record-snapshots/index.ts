import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

async function fetchPrice(ticker: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
    return price ?? null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  const body = await req.json().catch(() => ({}));
  const interval = body.interval === 'daily' ? 'daily' : '5min';

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data: portfolios } = await supabase
    .from('portfolios')
    .select('id, user_id, cash_balance');

  if (!portfolios?.length) {
    return new Response('No portfolios found', { status: 200 });
  }

  const portfolioIds = portfolios.map(p => p.id);
  const { data: allHoldings } = await supabase
    .from('holdings')
    .select('portfolio_id, ticker, shares, avg_cost')
    .in('portfolio_id', portfolioIds);

  const tickers = [...new Set((allHoldings ?? []).map(h => h.ticker))];
  const priceEntries = await Promise.all(
    tickers.map(async t => ({ ticker: t, price: await fetchPrice(t) }))
  );
  const priceMap = new Map(
    priceEntries
      .filter(e => e.price !== null)
      .map(e => [e.ticker, e.price!])
  );

  const holdingsByPortfolio = new Map<string, typeof allHoldings>();
  for (const h of allHoldings ?? []) {
    if (!holdingsByPortfolio.has(h.portfolio_id)) {
      holdingsByPortfolio.set(h.portfolio_id, []);
    }
    holdingsByPortfolio.get(h.portfolio_id)!.push(h);
  }

  const snapshots = portfolios.map(portfolio => {
    const holdings = holdingsByPortfolio.get(portfolio.id) ?? [];
    const holdingsValue = holdings.reduce((sum, h) => {
      const price = priceMap.get(h.ticker) ?? h.avg_cost;
      return sum + h.shares * price;
    }, 0);

    return {
      portfolio_id: portfolio.id,
      total_value: Number(portfolio.cash_balance) + holdingsValue,
      cash_balance: Number(portfolio.cash_balance),
      holdings_value: holdingsValue,
      interval,
    };
  });

  const { error } = await supabase
    .from('portfolio_snapshots')
    .insert(snapshots);

  if (error) {
    console.error('Snapshot insert error:', error);
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  console.log(`Recorded ${snapshots.length} snapshots (${interval})`);
  return new Response(
    JSON.stringify({ recorded: snapshots.length, interval }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
});