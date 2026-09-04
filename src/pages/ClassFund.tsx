import { useState } from 'react';
import { useApp } from '../state/AppContext';
import { useClassFund } from '../hooks/useClassFund';
import { useStockQuotes } from '../hooks/useStockQuotes';
import { useStockLookup } from '../hooks/useStockLookup';
import { STOCKS } from '../data/stocks';

export default function ClassFund() {
  const { state } = useApp();
  const user = state.u[state.role];
  const { fund, holdings, transactions, loading, error, joinFund, trade } = useClassFund(user.supabaseId);

  const [codeInput, setCodeInput] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const { quotes } = useStockQuotes();
  const { result: lookupResult, loading: lookupLoading, error: lookupError, lookup } = useStockLookup();
  const [searchInput, setSearchInput] = useState('');
  const [sym, setSym] = useState('AAPL');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [shares, setShares] = useState(1);
  const [trading, setTrading] = useState(false);
  const [tradeMsg, setTradeMsg] = useState<{ text: string; ok: boolean } | null>(null);

  function getLivePrice(s: string): number {
    return quotes.find(q => q.sym === s)?.price ?? STOCKS.find(st => st.sym === s)?.price ?? 0;
  }

  const livePrice = lookupResult?.sym === sym ? lookupResult.price : getLivePrice(sym);
  const cost = shares * livePrice;
  const holding = holdings.find(h => h.ticker === sym);

  async function handleJoin() {
    if (!codeInput.trim()) return;
    setJoining(true);
    setJoinError(null);
    const { error } = await joinFund(codeInput);
    setJoining(false);
    if (error) {
      setJoinError(error);
      return;
    }
    setCodeInput('');
  }

  async function handleTrade() {
    if (shares <= 0 || livePrice <= 0) return;
    setTrading(true);
    setTradeMsg(null);
    const { error } = await trade(sym, side, shares, livePrice);
    setTrading(false);
    if (error) {
      setTradeMsg({ text: error, ok: false });
      return;
    }
    setTradeMsg({ text: `${side === 'buy' ? 'Bought' : 'Sold'} ${shares} ${sym} @ $${livePrice.toFixed(2)}`, ok: true });
    setShares(1);
  }

  if (loading) {
    return (
      <div className="page-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ color: 'var(--text3)', fontSize: 13 }}>Loading class fund...</div>
      </div>
    );
  }

  if (!fund) {
    return (
      <div className="page-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div className="card" style={{ maxWidth: 420, width: '100%', padding: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🤝</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Join a Class Fund</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.6 }}>
            A class fund is one shared portfolio your whole class trades together. Ask your teacher or admin for the code.
          </div>
          <input
            type="text"
            placeholder="Class fund code"
            value={codeInput}
            onChange={e => { setCodeInput(e.target.value.toUpperCase()); setJoinError(null); }}
            onKeyDown={e => { if (e.key === 'Enter') handleJoin(); }}
            style={{
              width: '100%', padding: '10px 14px', fontSize: 14, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1,
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)',
              boxSizing: 'border-box', textAlign: 'center', fontWeight: 700,
            }}
          />
          {joinError && <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>{joinError}</div>}
          {error && <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>{error}</div>}
          <button
            className="btn btn-primary"
            style={{ width: '100%', opacity: codeInput.trim() && !joining ? 1 : 0.5 }}
            disabled={!codeInput.trim() || joining}
            onClick={handleJoin}
          >
            {joining ? 'Joining...' : 'Join Class Fund'}
          </button>
        </div>
      </div>
    );
  }

  const holdingsValue = holdings.reduce((sum, h) => sum + h.shares * getLivePrice(h.ticker), 0);
  const totalValue = holdingsValue + fund.cashBalance;
  const returnPct = fund.startingCash > 0 ? ((totalValue - fund.startingCash) / fund.startingCash) * 100 : 0;

  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <div className="page-title">{fund.name}</div>
          <div className="page-subtitle">Shared class portfolio — every member's trades affect the same cash and holdings</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div className="stat-card">
          <div className="stat-label">Total Value</div>
          <div className="stat-value">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className={returnPct >= 0 ? 'up' : 'dn'} style={{ fontSize: 12, marginTop: 4 }}>
            {returnPct >= 0 ? '+' : ''}{returnPct.toFixed(2)}%
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Cash Balance</div>
          <div className="stat-value">${fund.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Fund Code</div>
          <div className="stat-value" style={{ fontFamily: 'monospace', fontSize: 18 }}>{fund.code}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 12 }}>Holdings</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Ticker</th><th>Shares</th><th>Avg Cost</th><th>Current</th><th>Value</th><th>P&amp;L</th></tr>
                </thead>
                <tbody>
                  {holdings.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--text3)', fontSize: 13 }}>No holdings yet.</td></tr>
                  ) : (
                    holdings.map(h => {
                      const price = getLivePrice(h.ticker);
                      const value = h.shares * price;
                      const pnl = (price - h.avgCost) * h.shares;
                      return (
                        <tr key={h.ticker}>
                          <td style={{ fontWeight: 700, color: '#ffc107' }}>{h.ticker}</td>
                          <td>{h.shares}</td>
                          <td>${h.avgCost.toFixed(2)}</td>
                          <td>${price.toFixed(2)}</td>
                          <td>${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td style={{ color: pnl >= 0 ? '#00e676' : 'var(--red)', fontWeight: 600 }}>
                            {pnl >= 0 ? '+' : '-'}${Math.abs(pnl).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="section-title" style={{ marginBottom: 12 }}>Recent Activity</div>
            {transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--text3)', fontSize: 13 }}>No trades yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {transactions.map(t => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: t.type === 'buy' ? '#00e676' : 'var(--red)', fontWeight: 700, textTransform: 'uppercase', fontSize: 10 }}>
                        {t.type}
                      </span>
                      <span style={{ fontWeight: 700, color: '#ffc107' }}>{t.ticker}</span>
                      <span style={{ color: 'var(--text3)' }}>{t.shares} sh @ ${t.price.toFixed(2)}</span>
                    </div>
                    <span style={{ color: 'var(--text3)' }}>{t.userName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ width: 260, flexShrink: 0 }}>
          <div className="trade-panel">
            <div className="section-title" style={{ marginBottom: 14 }}>Trade for the Fund</div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Symbol</label>
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value.toUpperCase())}
                onKeyDown={e => { if (e.key === 'Enter') { lookup(searchInput); setSym(searchInput); } }}
                placeholder="e.g. AAPL"
                style={{ width: '100%', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}
              />
              {lookupError && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 6 }}>{lookupError}</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              <button
                style={{ padding: 10, borderRadius: 8, background: side === 'buy' ? '#00e676' : 'var(--surface)', color: side === 'buy' ? '#000' : 'var(--text2)', fontWeight: 700, fontSize: 13 }}
                onClick={() => setSide('buy')}
              >
                ▲ BUY
              </button>
              <button
                style={{ padding: 10, borderRadius: 8, background: side === 'sell' ? 'var(--red)' : 'var(--surface)', color: side === 'sell' ? '#fff' : 'var(--text2)', fontWeight: 700, fontSize: 13 }}
                onClick={() => setSide('sell')}
              >
                ▼ SELL
              </button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Shares</label>
              <input type="number" min={1} style={{ width: '100%' }} value={shares} onChange={e => setShares(Math.max(1, parseInt(e.target.value) || 1))} />
            </div>

            <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: '12px 14px', marginBottom: 16, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text3)' }}>Price</span>
                <span>${livePrice.toFixed(2)}</span>
              </div>
              {side === 'sell' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text3)' }}>Fund Owns</span>
                  <span>{holding?.shares ?? 0} sh</span>
                </div>
              )}
              <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span style={{ color: 'var(--text2)' }}>Total</span>
                <span style={{ color: 'var(--gr)', fontSize: 15 }}>${cost.toFixed(2)}</span>
              </div>
            </div>

            {tradeMsg && (
              <div style={{
                padding: '10px 14px', borderRadius: 'var(--radius)', marginBottom: 12, fontSize: 13,
                background: tradeMsg.ok ? 'var(--gr-dim)' : 'var(--red-dim)',
                color: tradeMsg.ok ? 'var(--gr)' : 'var(--red)',
              }}>
                {tradeMsg.text}
              </div>
            )}

            <button
              style={{ width: '100%', padding: 14, borderRadius: 10, background: side === 'buy' ? '#00e676' : 'var(--red)', color: side === 'buy' ? '#000' : '#fff', fontWeight: 700, fontSize: 14, opacity: trading || lookupLoading ? 0.6 : 1 }}
              disabled={trading || lookupLoading}
              onClick={handleTrade}
            >
              {trading ? 'Placing...' : side === 'buy' ? `▲ BUY ${sym}` : `▼ SELL ${sym}`}
            </button>

            <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text3)', textAlign: 'center' }}>
              Every trade here affects the whole class's shared portfolio.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
