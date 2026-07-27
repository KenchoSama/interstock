import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const STOCKS_TO_FETCH = new Set<string>();

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

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // 1. Get all portfolios with holdings
  const { data: portfolios } = await supabase
    .from('portfolios')
    .select('id, user_id, cash_balance');

  if (!portfolios?.length) {
    return new Response('No portfolios found', { status: 200 });
  }

  // 2. Get all holdings across all portfolios
  const portfolioIds = portfolios.map(p => p.id);
  const { data: allHoldings } = await supabase
    .from('holdings')
    .select('portfolio_id, ticker, shares, avg_cost')
    .in('portfolio_id', portfolioIds);

  // 3. Collect unique tickers and fetch prices in parallel
  const tickers = [...new Set((allHoldings ?? []).map(h => h.ticker))];
  const priceEntries = await Promise.all(
    tickers.map(async t => ({ ticker: t, price: await fetchPrice(t) }))
  );
  const priceMap = new Map(
    priceEntries
      .filter(e => e.price !== null)
      .map(e => [e.ticker, e.price!])
  );

  // 4. Group holdings by portfolio
  const holdingsByPortfolio = new Map<string, typeof allHoldings>();
  for (const h of allHoldings ?? []) {
    if (!holdingsByPortfolio.has(h.portfolio_id)) {
      holdingsByPortfolio.set(h.portfolio_id, []);
    }
    holdingsByPortfolio.get(h.portfolio_id)!.push(h);
  }

  // 5. Build and insert snapshots for all portfolios
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
      interval: '5min',
    };
  });

  const { error } = await supabase
    .from('portfolio_snapshots')
    .insert(snapshots);

  if (error) {
    console.error('Snapshot insert error:', error);
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  console.log(`Recorded ${snapshots.length} snapshots`);
  return new Response(
    JSON.stringify({ recorded: snapshots.length }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
});