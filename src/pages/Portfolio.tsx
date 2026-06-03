import { useMemo, useState } from 'react';
import { useApp } from '../state/AppContext';
import { STOCKS } from '../data/stocks';
import { genPrices, lineChart } from '../utils/charts';

const CHART_RANGES = ['1D', '5D', '1M', 'YTD', '1Y', '5Y'] as const;
type ChartRange = typeof CHART_RANGES[number];

const TV_SYMBOLS = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'SPY', 'QQQ'];

export default function Portfolio() {
  const { state, dispatch } = useApp();
  const user = state.u[state.role];
  const { tradeAction, sym, qty } = state;

  const [localQty, setLocalQty] = useState(qty);
  const [tradeMsg, setTradeMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [chartRange, setChartRange] = useState<ChartRange>('1Y');
  const [tvSym, setTvSym] = useState('AAPL');

  const selectedStock = STOCKS.find(s => s.sym === sym) ?? STOCKS[0];

  const portfolioValue = useMemo(() => {
    return user.portfolio.reduce((sum, h) => {
      const stock = STOCKS.find(s => s.sym === h.sym);
      return sum + h.shares * (stock ? stock.price : h.price);
    }, 0);
  }, [user.portfolio]);

  const totalInvested = useMemo(() => {
    return user.portfolio.reduce((sum, h) => sum + h.shares * h.avg, 0);
  }, [user.portfolio]);

  const pnl = portfolioValue - totalInvested;
  const totalValue = portfolioValue + user.cash;
  const pnlPct = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;

  const chartPrices = useMemo(() => genPrices(selectedStock.price, 60, 0.02), [sym]);
  const chartSvg = lineChart(chartPrices, 580, 160);

  const cost = localQty * selectedStock.price;
  const holding = user.portfolio.find(h => h.sym === sym);

  function executeTrade() {
    if (tradeAction === 'buy') {
      if (cost > user.cash) {
        setTradeMsg({ text: 'Insufficient cash balance.', ok: false });
        return;
      }
      dispatch({ type: 'BUY_STOCK', sym: selectedStock.sym, shares: localQty, price: selectedStock.price });
      dispatch({ type: 'ADD_XP', amount: 10 });
      setTradeMsg({ text: `Bought ${localQty} share${localQty !== 1 ? 's' : ''} of ${sym}!`, ok: true });
    } else {
      if (!holding || holding.shares < localQty) {
        setTradeMsg({ text: `You only have ${holding?.shares ?? 0} share${(holding?.shares ?? 0) !== 1 ? 's' : ''} of ${sym}.`, ok: false });
        return;
      }
      dispatch({ type: 'SELL_STOCK', sym: selectedStock.sym, shares: localQty, price: selectedStock.price });
      dispatch({ type: 'ADD_XP', amount: 10 });
      setTradeMsg({ text: `Sold ${localQty} share${localQty !== 1 ? 's' : ''} of ${sym}!`, ok: true });
    }
    setTimeout(() => setTradeMsg(null), 3000);
  }

  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

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
                      const stock = STOCKS.find(s => s.sym === h.sym);
                      const price = stock ? stock.price : h.price;
                      const gainPct = ((price - h.avg) / h.avg) * 100;
                      const totalVal = price * h.shares;
                      return (
                        <tr key={h.sym}>
                          <td style={{ fontWeight: 700, color: 'var(--gr)' }}>{h.sym}</td>
                          <td>{h.shares}</td>
                          <td>${h.avg.toFixed(2)}</td>
                          <td>${price.toFixed(2)}</td>
                          <td>${fmt(totalVal)}</td>
                          <td className={gainPct >= 0 ? 'up' : 'dn'}>
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
            <div className="chart-wrap" dangerouslySetInnerHTML={{ __html: chartSvg }} />
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

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Symbol
              </label>
              <select
                style={{ width: '100%' }}
                value={sym}
                onChange={e => dispatch({ type: 'SET_SYM', sym: e.target.value })}
              >
                {STOCKS.map(s => (
                  <option key={s.sym} value={s.sym}>
                    {s.sym} — ${s.price.toFixed(2)} ({s.chgPct >= 0 ? '+' : ''}{s.chgPct.toFixed(1)}%)
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              <button
                style={{
                  padding: '10px',
                  borderRadius: 8,
                  background: tradeAction === 'buy' ? 'var(--gr)' : 'var(--surface)',
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
                <span style={{ color: 'var(--gr)', fontWeight: 600 }}>{sym} — {selectedStock.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text3)' }}>Last Price</span>
                <span>${selectedStock.price.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text3)' }}>Change</span>
                <span className={selectedStock.chgPct >= 0 ? 'up' : 'dn'}>
                  {selectedStock.chgPct >= 0 ? '+' : ''}{selectedStock.chgPct.toFixed(1)}%
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
                background: tradeAction === 'buy' ? 'var(--gr)' : 'var(--red)',
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
