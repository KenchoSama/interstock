import { useMemo, useState, useEffect, useRef } from 'react';
import { useApp } from '../state/AppContext';
import { STOCKS } from '../data/stocks';
import { lineChart } from '../utils/charts';
import { persistTrade } from '../lib/persistTrade';
import { useStockQuotes } from '../hooks/useStockQuotes';
import { usePortfolioHistory } from '../hooks/usePortfolioHistory';
import ChartWithTooltip from '../components/ChartWithTooltip';
import { useStockLookup } from '../hooks/useStockLookup';

const CHART_RANGES = ['1D', '5D', '1M', 'YTD', '1Y', '5Y'] as const;
type ChartRange = typeof CHART_RANGES[number];

const TV_SYMBOLS = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'SPY', 'QQQ'];

export default function Portfolio() {
  const { state, dispatch } = useApp();
  const user = state.u[state.role];
  const { tradeAction, sym, qty } = state;
  const { quotes } = useStockQuotes();
  const { chartPoints, flatLine, snapshots } = usePortfolioHistory(user.portfolioId, 10000);
  const chartDates = ['', ...snapshots.map(s => s.recorded_at)];

  const { result: lookupResult, loading: lookupLoading, error: lookupError, lookup } = useStockLookup();
  const [searchInput, setSearchInput] = useState(sym);
  const searchRef = useRef<HTMLInputElement>(null);
  const [priceCache, setPriceCache] = useState<Record<string, number>>({});
  const [chgCache, setChgCache] = useState<Record<string, number>>({});

  useEffect(() => {
    if (lookupResult) {
      dispatch({ type: 'SET_SYM', sym: lookupResult.sym });
      setPriceCache(prev => ({ ...prev, [lookupResult.sym]: lookupResult.price }));
      setChgCache(prev => ({ ...prev, [lookupResult.sym]: lookupResult.chgPct }));
    }
  }, [lookupResult]);

  useEffect(() => {
    setSearchInput(sym);
  }, [sym]);

  useEffect(() => {
    const customHoldings = user.portfolio.filter(
      h => !STOCKS.find(s => s.sym === h.sym)
    );
    customHoldings.forEach(async h => {
      try {
        const res = await fetch(`/api/chart/${h.sym}?interval=1d&range=1d`);
        if (!res.ok) return;
        const data = await res.json();
        const meta = data?.chart?.result?.[0]?.meta;
        if (!meta) return;
        const price: number = meta.regularMarketPrice ?? 0;
        const prevClose: number = meta.chartPreviousClose ?? price;
        const chgPct = prevClose ? +((price - prevClose) / prevClose * 100).toFixed(2) : 0;
        setPriceCache(prev => ({ ...prev, [h.sym]: price }));
        setChgCache(prev => ({ ...prev, [h.sym]: chgPct }));
      } catch { /* ignore */ }
    });
  }, [user.portfolio]);

  function getLivePrice(s: string) {
    return quotes.find(q => q.sym === s)?.price
      ?? STOCKS.find(st => st.sym === s)?.price
      ?? priceCache[s]
      ?? 0;
  }
  function getLiveChgPct(s: string) {
    return quotes.find(q => q.sym === s)?.chgPct
      ?? STOCKS.find(st => st.sym === s)?.chgPct
      ?? chgCache[s]
      ?? 0;
  }

  const [localQty, setLocalQty] = useState(qty);
  const [tradeMsg, setTradeMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [chartRange, setChartRange] = useState<ChartRange>('1Y');
  const [tvSym, setTvSym] = useState('AAPL');

  const selectedStock = STOCKS.find(s => s.sym === sym);
  const livePrice = getLivePrice(sym);
  const liveChgPct = getLiveChgPct(sym);

  const portfolioValue = useMemo(() => {
    return user.portfolio.reduce((sum, h) => sum + h.shares * getLivePrice(h.sym), 0);
  }, [user.portfolio, quotes]);

  const totalInvested = useMemo(() => {
    return user.portfolio.reduce((sum, h) => sum + h.shares * h.avg, 0);
  }, [user.portfolio]);

  const pnl = portfolioValue - totalInvested;
  const totalValue = portfolioValue + user.cash;
  const pnlPct = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;

  const chartSvg = useMemo(() => {
    if (flatLine) {
      return lineChart(Array(30).fill(totalValue), 580, 160, '#00e676');
    }
    return lineChart(
      chartPoints,
      580, 160,
      chartPoints[chartPoints.length - 1] >= chartPoints[0] ? '#00e676' : 'var(--red)'
    );
  }, [chartPoints, flatLine, totalValue]);

  const cost = localQty * livePrice;
  const holding = user.portfolio.find(h => h.sym === sym);

  async function executeTrade() {
    const portfolioId = user.portfolioId;

    if (!portfolioId) {
      setTradeMsg({ text: 'Portfolio not loaded. Please refresh.', ok: false });
      return;
    }

    if (tradeAction === 'buy') {
      if (cost > user.cash) {
        setTradeMsg({ text: 'Insufficient cash balance.', ok: false });
        return;
      }

      dispatch({ type: 'BUY_STOCK', sym: sym, shares: localQty, price: livePrice });
      dispatch({ type: 'ADD_XP', amount: 10 });

      const newCash = user.cash - cost;
      const newPortfolioValue = portfolioValue + cost + newCash;

      await persistTrade('buy', sym, localQty, livePrice, portfolioId, newCash, newPortfolioValue);

      setTradeMsg({ text: `Bought ${localQty} share${localQty !== 1 ? 's' : ''} of ${sym}!`, ok: true });

    } else {
      if (!holding || holding.shares < localQty) {
        setTradeMsg({ text: `You only have ${holding?.shares ?? 0} shares of ${sym}.`, ok: false });
        return;
      }

      dispatch({ type: 'SELL_STOCK', sym: sym, shares: localQty, price: livePrice });
      dispatch({ type: 'ADD_XP', amount: 10 });

      const proceeds = localQty * livePrice;
      const newCash = user.cash + proceeds;
      const newPortfolioValue = portfolioValue - proceeds + newCash;

      await persistTrade('sell', sym, localQty, livePrice, portfolioId, newCash, newPortfolioValue);

      setTradeMsg({ text: `Sold ${localQty} share${localQty !== 1 ? 's' : ''} of ${sym}!`, ok: true });
    }

    setTimeout(() => setTradeMsg(null), 3000);
  }

  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="page-body">

      {/* Top stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div className="stat-card">
          <div className="stat-label">TOTAL VALUE</div>
          <div className="stat-value">${fmt(totalValue)}</div>
          <div className={pnlPct >= 0 ? 'up' : 'dn'} style={{ fontSize: 13, marginTop: 4 }}>
            {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">INVESTED</div>
          <div className="stat-value">${fmt(totalInvested)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">CASH</div>
          <div className="stat-value">${fmt(user.cash)}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Available</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">P&amp;L</div>
          <div className={`stat-value ${pnl >= 0 ? 'up' : 'dn'}`}>
            {pnl >= 0 ? '+' : '-'}${fmt(Math.abs(pnl))}
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

        {/* Left column */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Holdings table */}
          <div className="card">
            <div className="section-title" style={{ marginBottom: 12 }}>HOLDINGS</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>TICKER</th>
                    <th>SHARES</th>
                    <th>AVG COST</th>
                    <th>CURRENT</th>
                    <th>VALUE</th>
                    <th>RETURN</th>
                  </tr>
                </thead>
                <tbody>
                  {user.portfolio.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text3)', padding: '24px 16px' }}>
                        No holdings yet. Use the trade panel to buy your first stock.
                      </td>
                    </tr>
                  ) : (
                    user.portfolio.map(h => {
                      const price = getLivePrice(h.sym);
                      const gainPct = ((price - h.avg) / h.avg) * 100;
                      const totalVal = price * h.shares;
                      return (
                        <tr key={h.sym}>
                          <td style={{ fontWeight: 700, color: '#ffc107' }}>{h.sym}</td>
                          <td>{h.shares}</td>
                          <td>${h.avg.toFixed(2)}</td>
                          <td>${price.toFixed(2)}</td>
                          <td>${fmt(totalVal)}</td>
                          <td style={{ color: gainPct >= 0 ? '#00e676' : 'var(--red)', fontWeight: 600 }}>
                            {gainPct >= 0 ? '+' : ''}{gainPct.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Portfolio chart */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div className="section-title" style={{ margin: 0 }}>PORTFOLIO CHART</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {CHART_RANGES.map(r => (
                  <button
                    key={r}
                    onClick={() => setChartRange(r)}
                    style={{
                      padding: '3px 9px',
                      fontSize: 12,
                      borderRadius: 6,
                      background: chartRange === r ? 'var(--gr)' : 'var(--surface)',
                      color: chartRange === r ? '#000' : 'var(--text2)',
                      fontWeight: chartRange === r ? 700 : 400,
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <ChartWithTooltip
              chartSvg={chartSvg}
              chartPoints={chartPoints}
              flatLine={flatLine}
              totalValue={totalValue}
              dates={chartDates}
            />
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text3)' }}>
              {chartRange} &nbsp;
              <span className={pnlPct >= 0 ? 'up' : 'dn'} style={{ fontWeight: 600 }}>
                {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(1)}% return
              </span>
              &nbsp; · Paper portfolio · $10K start
            </div>
          </div>

          {/* Live Chart - TradingView */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div className="section-title" style={{ margin: 0 }}>LIVE CHART — TRADINGVIEW</div>
              <span style={{
                fontSize: 11, padding: '2px 8px',
                background: 'var(--red)', color: '#fff',
                borderRadius: 4, fontWeight: 700, letterSpacing: 1,
              }}>
                LIVE
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
              {TV_SYMBOLS.map(s => (
                <button
                  key={s}
                  onClick={() => setTvSym(s)}
                  style={{
                    padding: '4px 10px',
                    fontSize: 12,
                    borderRadius: 6,
                    background: tvSym === s ? 'var(--gr)' : 'var(--surface)',
                    color: tvSym === s ? '#000' : 'var(--text2)',
                    fontWeight: tvSym === s ? 700 : 400,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            <iframe
              key={tvSym}
              src={`https://s.tradingview.com/widgetembed/?symbol=${tvSym}&interval=D&theme=dark&style=1&locale=en&toolbar_bg=0c1a27&hide_side_toolbar=0`}
              style={{ width: '100%', height: 340, border: 'none', borderRadius: 8 }}
              allowFullScreen
            />
          </div>
        </div>

        {/* Right sidebar - Place Trade */}
        <div style={{ width: 260, flexShrink: 0 }}>
          <div className="trade-panel">
            <div className="section-title" style={{ marginBottom: 14 }}>PLACE TRADE</div>

            {/* Symbol search */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Symbol
              </label>
              <input
                ref={searchRef}
                type="text"
                placeholder="e.g. AAPL, TSLA, PLTR"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value.toUpperCase())}
                onKeyDown={e => { if (e.key === 'Enter') lookup(searchInput); }}
                onBlur={() => { if (searchInput && searchInput !== sym) lookup(searchInput); }}
                style={{ width: '100%', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}
              />

              {lookupError && (
                <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 6 }}>
                  {lookupError}
                </div>
              )}

              {lookupResult && lookupResult.sym !== sym && (
                <div style={{
                  marginTop: 8, padding: '8px 10px',
                  background: 'var(--gr-dim)', border: '1px solid var(--gr)',
                  borderRadius: 8, fontSize: 12,
                }}>
                  <div style={{ fontWeight: 700, color: 'var(--gr)' }}>{lookupResult.sym}</div>
                  <div style={{ color: 'var(--text3)', fontSize: 11 }}>{lookupResult.name}</div>
                  <div style={{ color: 'var(--text)', fontWeight: 600 }}>${lookupResult.price.toFixed(2)}</div>
                </div>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                {['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'META', 'GOOGL', 'JPM'].map(s => (
                  <button
                    key={s}
                    onClick={() => { setSearchInput(s); lookup(s); }}
                    style={{
                      padding: '2px 7px', fontSize: 10, borderRadius: 4,
                      background: sym === s ? 'var(--gr-dim)' : 'var(--surface)',
                      border: `1px solid ${sym === s ? 'var(--gr)' : 'var(--border)'}`,
                      color: sym === s ? 'var(--gr)' : 'var(--text3)',
                      fontWeight: sym === s ? 700 : 400,
                      cursor: 'pointer',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              <button
                style={{
                  padding: '10px',
                  borderRadius: 8,
                  background: tradeAction === 'buy' ? '#00e676' : 'var(--surface)',
                  color: tradeAction === 'buy' ? '#000' : 'var(--text2)',
                  fontWeight: 700,
                  fontSize: 13,
                }}
                onClick={() => dispatch({ type: 'SET_TRADE_ACTION', action: 'buy' })}
              >
                ▲ BUY
              </button>
              <button
                style={{
                  padding: '10px',
                  borderRadius: 8,
                  background: tradeAction === 'sell' ? 'var(--red)' : 'var(--surface)',
                  color: tradeAction === 'sell' ? '#fff' : 'var(--text2)',
                  fontWeight: 700,
                  fontSize: 13,
                }}
                onClick={() => dispatch({ type: 'SET_TRADE_ACTION', action: 'sell' })}
              >
                ▼ SELL
              </button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Quantity
              </label>
              <input
                type="number"
                min={1}
                style={{ width: '100%' }}
                value={localQty}
                onChange={e => {
                  const v = Math.max(1, parseInt(e.target.value) || 1);
                  setLocalQty(v);
                  dispatch({ type: 'SET_QTY', qty: v });
                }}
              />
            </div>

            <div style={{
              background: 'var(--bg3)',
              borderRadius: 'var(--radius)',
              padding: '12px 14px',
              marginBottom: 16,
              fontSize: 13,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text3)' }}>Symbol</span>
                <span style={{ color: '#ffc107', fontWeight: 600 }}>
                  {sym} — {lookupResult?.sym === sym ? lookupResult.name : selectedStock?.name ?? sym}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text3)' }}>Last Price</span>
                <span>${livePrice.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text3)' }}>Change</span>
                <span className={liveChgPct >= 0 ? 'up' : 'dn'}>
                  {liveChgPct >= 0 ? '+' : ''}{liveChgPct.toFixed(2)}%
                </span>
              </div>
              <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span style={{ color: 'var(--text2)' }}>Order Total</span>
                <span style={{ color: 'var(--gr)', fontSize: 15 }}>
                  ${cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {tradeMsg && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius)',
                marginBottom: 12,
                fontSize: 13,
                background: tradeMsg.ok ? 'var(--gr-dim)' : 'var(--red-dim)',
                color: tradeMsg.ok ? 'var(--gr)' : 'var(--red)',
                border: `1px solid ${tradeMsg.ok ? 'var(--gr2)' : 'var(--red)'}`,
              }}>
                {tradeMsg.text}
              </div>
            )}

            <button
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 10,
                background: tradeAction === 'buy' ? '#00e676' : 'var(--red)',
                color: tradeAction === 'buy' ? '#000' : '#fff',
                fontWeight: 700,
                fontSize: 14,
              }}
              onClick={executeTrade}
            >
              {tradeAction === 'buy' ? `▲ BUY ${sym}` : `▼ SELL ${sym}`}
            </button>

            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>
              💡 Paper trading — virtual money only
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
