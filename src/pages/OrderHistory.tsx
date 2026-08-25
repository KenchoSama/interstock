import { useEffect, useRef, useState } from 'react';
import { useApp } from '../state/AppContext';
import { STOCKS } from '../data/stocks';
import { useStockQuotes } from '../hooks/useStockQuotes';
import { useStockLookup } from '../hooks/useStockLookup';
import { useOrderHistory, type LimitOrder } from '../hooks/useOrderHistory';
import { persistTrade } from '../lib/persistTrade';

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function OrderHistory() {
  const { state, dispatch } = useApp();
  const user = state.u[state.role];
  const { quotes } = useStockQuotes();
  const { result: lookupResult, error: lookupError, lookup } = useStockLookup();

  const {
    workingOrders, canceledOrders, filledTrades, loading, error,
    placeLimitOrder, cancelOrder, markFilled,
  } = useOrderHistory(user.portfolioId);

  function getPriceFor(ticker: string): number {
    return quotes.find(q => q.sym === ticker)?.price ?? STOCKS.find(s => s.sym === ticker)?.price ?? 0;
  }

  // ── Fill checking ──
  const filling = useRef(false);
  useEffect(() => {
    if (filling.current || workingOrders.length === 0 || !user.portfolioId) return;

    async function checkFills() {
      filling.current = true;
      const holdingsValue = user.portfolio.reduce((sum, h) => sum + h.shares * getPriceFor(h.sym), 0);

      for (const order of workingOrders) {
        const price = getPriceFor(order.ticker);
        if (price === 0) continue;

        const conditionMet = order.side === 'buy' ? price <= order.limitPrice : price >= order.limitPrice;
        if (!conditionMet) continue;

        if (order.side === 'buy') {
          const cost = price * order.shares;
          if (cost > user.cash) {
            await cancelOrder(order.id);
            setOrderMsg({ text: `Canceled ${order.ticker} buy limit order — insufficient cash at fill time.`, ok: false });
            continue;
          }
          dispatch({ type: 'BUY_STOCK', sym: order.ticker, shares: order.shares, price });
          dispatch({ type: 'ADD_XP', amount: 10 });
          const newCash = user.cash - cost;
          const newPortfolioValue = holdingsValue + cost + newCash;
          await persistTrade('buy', order.ticker, order.shares, price, user.portfolioId!, newCash, newPortfolioValue);
          await markFilled(order.id, price);
          setOrderMsg({ text: `Filled: bought ${order.shares} ${order.ticker} @ $${price.toFixed(2)}`, ok: true });
        } else {
          const holding = user.portfolio.find(h => h.sym === order.ticker);
          if (!holding || holding.shares < order.shares) {
            await cancelOrder(order.id);
            setOrderMsg({ text: `Canceled ${order.ticker} sell limit order — not enough shares at fill time.`, ok: false });
            continue;
          }
          dispatch({ type: 'SELL_STOCK', sym: order.ticker, shares: order.shares, price });
          dispatch({ type: 'ADD_XP', amount: 10 });
          const proceeds = price * order.shares;
          const newCash = user.cash + proceeds;
          const newPortfolioValue = holdingsValue - proceeds + newCash;
          await persistTrade('sell', order.ticker, order.shares, price, user.portfolioId!, newCash, newPortfolioValue);
          await markFilled(order.id, price);
          setOrderMsg({ text: `Filled: sold ${order.shares} ${order.ticker} @ $${price.toFixed(2)}`, ok: true });
        }
      }
      filling.current = false;
    }

    checkFills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workingOrders, quotes]);

  // ── Place order form ──
  const [ticker, setTicker] = useState('');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [shares, setShares] = useState(1);
  const [limitPrice, setLimitPrice] = useState<number>(0);
  const [placing, setPlacing] = useState(false);
  const [orderMsg, setOrderMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (lookupResult) {
      setTicker(lookupResult.sym);
      if (!limitPrice) setLimitPrice(lookupResult.price);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lookupResult]);

  async function handlePlaceOrder() {
    const sym = ticker.trim().toUpperCase();
    if (!sym || shares <= 0 || limitPrice <= 0) return;

    setPlacing(true);
    setOrderMsg(null);
    const { error } = await placeLimitOrder({ ticker: sym, side, shares, limitPrice });
    setPlacing(false);

    if (error) {
      setOrderMsg({ text: error, ok: false });
      return;
    }
    setOrderMsg({ text: `Working order placed: ${side} ${shares} ${sym} @ $${limitPrice.toFixed(2)}`, ok: true });
    setTicker('');
    setShares(1);
    setLimitPrice(0);
  }

  async function handleCancel(order: LimitOrder) {
    const { error } = await cancelOrder(order.id);
    if (error) setOrderMsg({ text: error, ok: false });
  }

  // ── Merge filled + canceled into one history list, sorted by date desc ──
  const history = [
    ...filledTrades.map(t => ({
      key: `tx-${t.id}`, ticker: t.ticker, side: t.side, shares: t.shares,
      price: t.price, status: 'filled' as const, orderType: t.orderType, date: t.executedAt,
    })),
    ...canceledOrders.map(o => ({
      key: `order-${o.id}`, ticker: o.ticker, side: o.side, shares: o.shares,
      price: o.filledPrice ?? o.limitPrice, status: o.status, orderType: 'limit' as const,
      date: o.filledAt ?? o.createdAt,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const canPlace = ticker.trim().length > 0 && shares > 0 && limitPrice > 0 && !placing;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Order History</div>
          <div className="page-subtitle">Your filled and working stock orders</div>
        </div>
      </div>

      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>

          {/* Left: working orders + history */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {orderMsg && (
              <div style={{
                padding: '10px 14px', borderRadius: 'var(--radius)', fontSize: 13,
                background: orderMsg.ok ? 'var(--gr-dim)' : 'var(--red-dim)',
                color: orderMsg.ok ? 'var(--gr)' : 'var(--red)',
              }}>
                {orderMsg.text}
              </div>
            )}

            {/* Working orders */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Working Orders ({workingOrders.length})
              </div>
              {workingOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 24, color: 'var(--text3)', fontSize: 13 }}>
                  No working orders. Place a limit order to see it here.
                </div>
              ) : (
                <div className="table-wrap">
                  <table style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Ticker</th>
                        <th>Side</th>
                        <th>Shares</th>
                        <th>Limit Price</th>
                        <th>Current</th>
                        <th>Placed</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {workingOrders.map(o => {
                        const current = getPriceFor(o.ticker);
                        return (
                          <tr key={o.id}>
                            <td style={{ fontWeight: 700, color: '#ffc107' }}>{o.ticker}</td>
                            <td style={{ textTransform: 'capitalize', color: o.side === 'buy' ? '#00e676' : 'var(--red)' }}>{o.side}</td>
                            <td>{o.shares}</td>
                            <td>${o.limitPrice.toFixed(2)}</td>
                            <td>{current > 0 ? `$${current.toFixed(2)}` : '—'}</td>
                            <td style={{ color: 'var(--text3)', fontSize: 11 }}>{formatDateTime(o.createdAt)}</td>
                            <td>
                              <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }} onClick={() => handleCancel(o)}>
                                Cancel
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Filled + canceled history */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Order History
              </div>

              {loading && (
                <div style={{ textAlign: 'center', padding: 24, color: 'var(--text3)', fontSize: 13 }}>Loading...</div>
              )}
              {!loading && error && (
                <div style={{ textAlign: 'center', padding: 24, color: 'var(--red)', fontSize: 13 }}>Couldn't load orders. {error}</div>
              )}
              {!loading && !error && history.length === 0 && (
                <div style={{ textAlign: 'center', padding: 24, color: 'var(--text3)', fontSize: 13 }}>No orders yet.</div>
              )}
              {!loading && !error && history.length > 0 && (
                <div className="table-wrap">
                  <table style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Ticker</th>
                        <th>Side</th>
                        <th>Shares</th>
                        <th>Price</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map(h => (
                        <tr key={h.key}>
                          <td style={{ fontWeight: 700, color: '#ffc107' }}>{h.ticker}</td>
                          <td style={{ textTransform: 'capitalize', color: h.side === 'buy' ? '#00e676' : 'var(--red)' }}>{h.side}</td>
                          <td>{h.shares}</td>
                          <td>${h.price.toFixed(2)}</td>
                          <td style={{ textTransform: 'capitalize', color: 'var(--text3)', fontSize: 11 }}>{h.orderType}</td>
                          <td>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20,
                              fontSize: 10, fontWeight: 700,
                              background: h.status === 'filled' ? 'var(--gr-dim)' : 'var(--surface2)',
                              color: h.status === 'filled' ? 'var(--gr)' : 'var(--text3)',
                            }}>
                              {h.status.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text3)', fontSize: 11 }}>{formatDateTime(h.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right: place limit order */}
          <div className="trade-panel">
            <div className="section-title" style={{ marginBottom: 14 }}>PLACE LIMIT ORDER</div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Symbol
              </label>
              <input
                type="text"
                placeholder="e.g. AAPL, TSLA"
                value={ticker}
                onChange={e => setTicker(e.target.value.toUpperCase())}
                onKeyDown={e => { if (e.key === 'Enter') lookup(ticker); }}
                onBlur={() => { if (ticker) lookup(ticker); }}
                style={{ width: '100%', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}
              />
              {lookupError && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 6 }}>{lookupError}</div>}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                {['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN'].map(s => (
                  <button
                    key={s}
                    onClick={() => { setTicker(s); lookup(s); }}
                    style={{
                      padding: '2px 7px', fontSize: 10, borderRadius: 4,
                      background: ticker === s ? 'var(--gr-dim)' : 'var(--surface)',
                      border: `1px solid ${ticker === s ? 'var(--gr)' : 'var(--border)'}`,
                      color: ticker === s ? 'var(--gr)' : 'var(--text3)',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
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
              <label style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Shares
              </label>
              <input type="number" min={1} style={{ width: '100%' }} value={shares} onChange={e => setShares(Math.max(1, parseInt(e.target.value) || 1))} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Limit Price ($)
              </label>
              <input type="number" min={0.01} step="0.01" style={{ width: '100%' }} value={limitPrice || ''} onChange={e => setLimitPrice(parseFloat(e.target.value) || 0)} />
            </div>

            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 14, lineHeight: 1.6 }}>
              {side === 'buy'
                ? 'Fills automatically once the price drops to or below your limit.'
                : 'Fills automatically once the price rises to or above your limit.'}
              {' '}Cash and share availability are checked at fill time, not when placed.
            </div>

            <button
              style={{
                width: '100%', padding: 14, borderRadius: 10, fontWeight: 700, fontSize: 14,
                background: side === 'buy' ? '#00e676' : 'var(--red)', color: side === 'buy' ? '#000' : '#fff',
                opacity: canPlace ? 1 : 0.5, cursor: canPlace ? 'pointer' : 'default',
              }}
              disabled={!canPlace}
              onClick={handlePlaceOrder}
            >
              {placing ? 'Placing...' : `Place ${side === 'buy' ? 'Buy' : 'Sell'} Limit Order`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
