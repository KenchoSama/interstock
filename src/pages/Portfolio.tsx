import { useMemo, useState } from 'react';
import { useApp } from '../state/AppContext';
import { STOCKS } from '../data/stocks';
import { genPrices, lineChart } from '../utils/charts';

export default function Portfolio() {
  const { state, dispatch } = useApp();
  const user = state.u[state.role];
  const { tradeAction, sym, qty } = state;

  const [localQty, setLocalQty] = useState(qty);
  const [tradeMsg, setTradeMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const selectedStock = STOCKS.find(s => s.sym === sym) ?? STOCKS[0];

  const portfolioValue = useMemo(() => {
    return user.portfolio.reduce((sum, h) => {
      const stock = STOCKS.find(s => s.sym === h.sym);
      return sum + h.shares * (stock ? stock.price : h.price);
    }, 0);
  }, [user.portfolio]);

  const chartPrices = useMemo(() => genPrices(selectedStock.price, 60, 0.02), [sym]);
  const chartSvg = lineChart(chartPrices, 400, 140);

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

  return (
    <div className="page-body">
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="section-title">Holdings</div>

          <div className="table-wrap" style={{ marginBottom: 16 }}>
            <table>
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Shares</th>
                  <th>Avg Cost</th>
                  <th>Price</th>
                  <th>Gain / Loss</th>
                  <th>Total Value</th>
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
                    const gainDollar = (price - h.avg) * h.shares;
                    const gainPct = ((price - h.avg) / h.avg) * 100;
                    const totalVal = price * h.shares;
                    return (
                      <tr key={h.sym}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{h.sym}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{stock?.name ?? ''}</div>
                        </td>
                        <td>{h.shares}</td>
                        <td>${h.avg.toFixed(2)}</td>
                        <td>${price.toFixed(2)}</td>
                        <td>
                          <div className={gainDollar >= 0 ? 'up' : 'dn'}>
                            {gainDollar >= 0 ? '+' : ''}${Math.abs(gainDollar).toFixed(2)}
                          </div>
                          <div className={gainPct >= 0 ? 'up' : 'dn'} style={{ fontSize: 11 }}>
                            {gainPct >= 0 ? '+' : ''}{gainPct.toFixed(2)}%
                          </div>
                        </td>
                        <td style={{ fontWeight: 600 }}>${totalVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div className="stat-card" style={{ flex: 1 }}>
              <div className="stat-label">Cash Balance</div>
              <div className="stat-value">${user.cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div className="stat-card" style={{ flex: 1 }}>
              <div className="stat-label">Portfolio Value</div>
              <div className="stat-value">${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div className="stat-card" style={{ flex: 1 }}>
              <div className="stat-label">Total Account</div>
              <div className="stat-value">${(portfolioValue + user.cash).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div className="section-title" style={{ margin: 0 }}>
                {sym} Price Chart
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                ${selectedStock.price.toFixed(2)}
                <span className={selectedStock.chg >= 0 ? 'up' : 'dn'} style={{ marginLeft: 8 }}>
                  {selectedStock.chg >= 0 ? '+' : ''}{selectedStock.chg.toFixed(2)} ({selectedStock.chgPct.toFixed(2)}%)
                </span>
              </div>
            </div>
            <div className="chart-wrap" dangerouslySetInnerHTML={{ __html: chartSvg }} />
          </div>
        </div>

        <div style={{ width: 300, flexShrink: 0 }}>
          <div className="trade-panel">
            <div className="trade-tabs">
              <button
                className={`trade-tab ${tradeAction === 'buy' ? 'active buy' : ''}`}
                onClick={() => dispatch({ type: 'SET_TRADE_ACTION', action: 'buy' })}
              >
                Buy
              </button>
              <button
                className={`trade-tab ${tradeAction === 'sell' ? 'active sell' : ''}`}
                onClick={() => dispatch({ type: 'SET_TRADE_ACTION', action: 'sell' })}
              >
                Sell
              </button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                Stock
              </label>
              <select
                style={{ width: '100%' }}
                value={sym}
                onChange={e => dispatch({ type: 'SET_SYM', sym: e.target.value })}
              >
                {STOCKS.map(s => (
                  <option key={s.sym} value={s.sym}>
                    {s.sym} — ${s.price.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
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
                <span style={{ color: 'var(--text3)' }}>Price per share</span>
                <span>${selectedStock.price.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text3)' }}>Shares</span>
                <span>{localQty}</span>
              </div>
              <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span style={{ color: 'var(--text2)' }}>Total Cost</span>
                <span style={{ color: tradeAction === 'buy' ? 'var(--red)' : 'var(--gr)' }}>
                  {tradeAction === 'buy' ? '-' : '+'}${cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              {tradeAction === 'sell' && holding && (
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
                  You own {holding.shares} shares
                </div>
              )}
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
              className={`btn ${tradeAction === 'buy' ? 'btn-primary' : 'btn-danger'}`}
              style={{ width: '100%' }}
              onClick={executeTrade}
            >
              {tradeAction === 'buy' ? `Buy ${localQty} Share${localQty !== 1 ? 's' : ''}` : `Sell ${localQty} Share${localQty !== 1 ? 's' : ''}`}
            </button>

            <div style={{ marginTop: 16, padding: '12px', background: 'var(--bg3)', borderRadius: 'var(--radius)' }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {selectedStock.sym} Info
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 0', fontSize: 12 }}>
                <span style={{ color: 'var(--text3)' }}>Sector</span>
                <span style={{ textAlign: 'right' }}>{selectedStock.sector}</span>
                <span style={{ color: 'var(--text3)' }}>Mkt Cap</span>
                <span style={{ textAlign: 'right' }}>{selectedStock.mktCap}</span>
                <span style={{ color: 'var(--text3)' }}>P/E</span>
                <span style={{ textAlign: 'right' }}>{selectedStock.pe}x</span>
                <span style={{ color: 'var(--text3)' }}>Beta</span>
                <span style={{ textAlign: 'right' }}>{selectedStock.beta}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
