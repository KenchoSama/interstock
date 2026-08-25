import { useState } from 'react';
import { useFuturesQuotes } from '../hooks/useFuturesQuotes';
import { useApp } from '../state/AppContext';
import { useFuturesPositions, type FuturesPosition } from '../hooks/useFuturesPositions';
import { supabase } from '../lib/supabase';

// ── Data ─────────────────────────────────────────────────────────────────────
// marginPerContract / multiplier are numeric versions of the margin/contract
// columns below, used to actually price and settle a paper-trading position.

const FUTURES_DATA = [
  { name: 'Crude Oil',    ticker: 'CL', price: 78.42,   chg: -0.87, chgPct: -1.10, unit: 'bbl',   exchange: 'NYMEX', margin: '$5,940',  contract: '1,000 bbl',    marginPerContract: 5940,  multiplier: 1000 },
  { name: 'Gold',         ticker: 'GC', price: 2342.60,  chg:  8.30, chgPct:  0.36, unit: 'oz',    exchange: 'COMEX', margin: '$9,900',  contract: '100 oz',       marginPerContract: 9900,  multiplier: 100  },
  { name: 'S&P 500',      ticker: 'ES', price: 5218.75,  chg: 12.25, chgPct:  0.24, unit: 'index', exchange: 'CME',   margin: '$13,200', contract: '$50 × Index',  marginPerContract: 13200, multiplier: 50   },
  { name: 'Corn',         ticker: 'ZC', price: 452.25,   chg: -3.50, chgPct: -0.77, unit: 'bu',    exchange: 'CBOT',  margin: '$1,650',  contract: '5,000 bu',     marginPerContract: 1650,  multiplier: 50   },
  { name: 'Natural Gas',  ticker: 'NG', price: 2.184,    chg:  0.042, chgPct: 1.96, unit: 'MMBtu', exchange: 'NYMEX', margin: '$2,310',  contract: '10,000 MMBtu', marginPerContract: 2310,  multiplier: 10000 },
];

const CONCEPTS = [
  {
    name: 'Contango',
    symbol: '📈 Contango',
    color: '#ff4d6d',
    description: 'Futures price > spot price. The curve slopes upward. Common in commodities with storage costs — traders expect higher prices in the future.',
  },
  {
    name: 'Backwardation',
    symbol: '📉 Backwardation',
    color: '#00d4a8',
    description: 'Futures price < spot price. Signals high immediate demand or supply disruptions. The futures curve slopes downward.',
  },
  {
    name: 'Margin',
    symbol: '💵 Margin',
    color: '#f9c74f',
    description: 'Good-faith deposit to open a position — typically 3–10% of contract value. Creates leverage but amplifies both gains and losses.',
  },
  {
    name: 'Leverage',
    symbol: '⚡ Leverage',
    color: '#4d9fff',
    description: 'Control large contract values with a small deposit. A 5% price move on a $150K contract can double a $7,500 margin — or wipe it out.',
  },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function FuturesTipBanner() {
  return (
    <div style={{
      display: 'flex', gap: 10, alignItems: 'flex-start',
      background: 'var(--blue-dim)', border: '1px solid var(--blue)',
      borderRadius: 'var(--radius)', padding: '12px 14px', marginBottom: 16, fontSize: 13,
    }}>
      <span style={{ fontSize: 18 }}>📋</span>
      <div style={{ color: 'var(--text2)' }}>
        <strong style={{ color: 'var(--text)' }}>Futures:</strong>{' '}
        Legal agreements to buy or sell an asset at a set price on a future date.
        Both parties are <strong>obligated</strong> — unlike options.
        Highly leveraged. All data below is simulated for educational use only.
      </div>
    </div>
  );
}

function FuturesContractsTable({
  data, selectedTicker, onSelect, quotes, loading,
}: {
  data: typeof FUTURES_DATA;
  selectedTicker: string | null;
  onSelect: (ticker: string, price: number) => void;
  quotes: ReturnType<typeof useFuturesQuotes>['quotes'];
  loading: boolean;
}) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-title" style={{ margin: 0 }}>Futures Contracts</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ fontSize: 10, padding: '2px 8px', background: 'var(--gr-dim)', color: 'var(--gr)', borderRadius: 4, fontWeight: 700, letterSpacing: 1 }}>
            {loading ? 'LOADING' : 'LIVE PRICES'}
          </span>
          <span style={{ fontSize: 11, padding: '2px 8px', background: 'var(--yellow)', color: '#000', borderRadius: 4, fontWeight: 700 }}>
            EDUCATIONAL ONLY
          </span>
        </div>
      </div>

      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>
        Click a contract row to trade it.
      </div>

      {/* Column headers */}
      <div style={{
        display: 'flex', fontSize: 10, fontWeight: 600,
        borderBottom: '1px solid var(--border2)', paddingBottom: 6, marginBottom: 4,
        color: 'var(--text3)', letterSpacing: '0.4px',
      }}>
        <span style={{ width: 120 }}>CONTRACT</span>
        <span style={{ width: 60, textAlign: 'center' }}>TICKER</span>
        <span style={{ width: 80, textAlign: 'center' }}>EXCHANGE</span>
        <span style={{ flex: 1, textAlign: 'right' }}>PRICE</span>
        <span style={{ flex: 1, textAlign: 'right' }}>CHANGE</span>
        <span style={{ flex: 1, textAlign: 'right' }}>MARGIN REQ.</span>
        <span style={{ flex: 1, textAlign: 'right' }}>CONTRACT SIZE</span>
      </div>

      {data.map(f => {
        const q = quotes.find(q => q.ticker === f.ticker);
        const price = q?.price ?? f.price;
        const chg = q?.chg ?? f.chg;
        const chgPct = q?.chgPct ?? f.chgPct;
        const isSelected = selectedTicker === f.ticker;
        return (
          <div
            key={f.ticker}
            onClick={() => onSelect(f.ticker, price)}
            style={{
              display: 'flex', alignItems: 'center', fontSize: 12,
              borderBottom: '1px solid rgba(30,58,80,0.5)',
              padding: '6px 0', cursor: 'pointer',
              background: isSelected ? 'rgba(0,230,118,0.06)' : 'transparent',
              borderRadius: isSelected ? 4 : 0,
            }}
          >
            <span style={{ width: 120, fontWeight: 600, color: 'var(--text)' }}>{f.name}</span>
            <span style={{ width: 60, textAlign: 'center', fontFamily: 'monospace', background: 'var(--bg3)', padding: '1px 6px', borderRadius: 4, fontSize: 11, color: 'var(--yellow)', fontWeight: 700 }}>
              {f.ticker}
            </span>
            <span style={{ width: 80, textAlign: 'center', color: 'var(--text3)', fontSize: 11 }}>{f.exchange}</span>
            <span style={{ flex: 1, textAlign: 'right', fontWeight: 700, fontFamily: 'monospace' }}>
              ${price.toLocaleString('en-US', { minimumFractionDigits: price < 10 ? 3 : 2, maximumFractionDigits: price < 10 ? 3 : 2 })}
            </span>
            <span style={{ flex: 1, textAlign: 'right' }} className={chg >= 0 ? 'up' : 'dn'}>
              {chg >= 0 ? '+' : ''}{chg.toFixed(price < 10 ? 3 : 2)} ({chgPct >= 0 ? '+' : ''}{chgPct.toFixed(2)}%)
            </span>
            <span style={{ flex: 1, textAlign: 'right', color: 'var(--text2)' }}>{f.margin}</span>
            <span style={{ flex: 1, textAlign: 'right', color: 'var(--text3)', fontSize: 11 }}>{f.contract}</span>
          </div>
        );
      })}

      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text3)' }}>
        Prices are live from Yahoo Finance. Margin requirements are approximate.
      </div>
    </div>
  );
}

function FuturesConceptsGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
      {CONCEPTS.map(c => (
        <div key={c.name} className="card">
          <div style={{ fontSize: 14, fontWeight: 700, color: c.color, marginBottom: 6, fontFamily: 'monospace' }}>
            {c.symbol}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.55 }}>{c.description}</div>
        </div>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Futures() {
  const { state, dispatch } = useApp();
  const user = state.u[state.role];
  const { positions, loading: positionsLoading, openPosition, closePosition } = useFuturesPositions(user.portfolioId);
  const { quotes, loading: quotesLoading } = useFuturesQuotes();

  function getPriceFor(ticker: string): number {
    return quotes.find(q => q.ticker === ticker)?.price ?? FUTURES_DATA.find(f => f.ticker === ticker)?.price ?? 0;
  }

  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [side, setSide] = useState<'long' | 'short'>('long');
  const [contracts, setContracts] = useState(1);
  const [trading, setTrading] = useState(false);
  const [tradeMsg, setTradeMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const selectedProduct = selectedTicker ? FUTURES_DATA.find(f => f.ticker === selectedTicker) : null;
  const entryPrice = selectedTicker ? getPriceFor(selectedTicker) : 0;
  const marginRequired = selectedProduct ? selectedProduct.marginPerContract * contracts : 0;

  function selectContract(ticker: string) {
    setSelectedTicker(ticker);
    setTradeMsg(null);
  }

  async function handleOpenPosition() {
    if (!selectedProduct) return;
    if (marginRequired > user.cash) {
      setTradeMsg({ text: 'Insufficient cash balance for margin.', ok: false });
      return;
    }

    setTrading(true);
    const { error } = await openPosition({
      ticker: selectedProduct.ticker,
      side,
      contracts,
      entryPrice,
      multiplier: selectedProduct.multiplier,
      marginPosted: marginRequired,
    });
    setTrading(false);

    if (error) {
      setTradeMsg({ text: error, ok: false });
      return;
    }

    dispatch({ type: 'ADJUST_CASH', amount: -marginRequired });
    dispatch({ type: 'ADD_XP', amount: 10 });
    if (user.supabaseId) await supabase.rpc('increment_xp', { user_id: user.supabaseId, amount: 10 });

    setTradeMsg({ text: `Opened ${side} ${contracts} ${selectedProduct.ticker} contract${contracts > 1 ? 's' : ''} @ $${entryPrice.toFixed(2)}!`, ok: true });
    setSelectedTicker(null);
    setContracts(1);
  }

  async function handleClosePosition(pos: FuturesPosition) {
    const currentPrice = getPriceFor(pos.ticker);
    const pnl = (currentPrice - pos.entryPrice) * pos.multiplier * pos.contracts * (pos.side === 'long' ? 1 : -1);
    const closeValue = Math.max(0, pos.marginPosted + pnl);

    const { error } = await closePosition(pos.id, currentPrice, closeValue);
    if (error) {
      setTradeMsg({ text: error, ok: false });
      return;
    }

    dispatch({ type: 'ADJUST_CASH', amount: closeValue });
    dispatch({ type: 'ADD_XP', amount: 10 });
    if (user.supabaseId) await supabase.rpc('increment_xp', { user_id: user.supabaseId, amount: 10 });

    setTradeMsg({ text: `Closed ${pos.ticker} ${pos.side} for $${closeValue.toFixed(2)}.`, ok: true });
  }

  return (
    <div className="page-body">

      {/* 1. Tip banner */}
      <FuturesTipBanner />

      {/* 2. Contracts table */}
      <FuturesContractsTable
        data={FUTURES_DATA}
        selectedTicker={selectedTicker}
        onSelect={selectContract}
        quotes={quotes}
        loading={quotesLoading}
      />

      {/* 2b. Trade ticket */}
      {selectedProduct && (
        <div className="card" style={{ marginBottom: 16, border: '1px solid var(--gr)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div className="section-title" style={{ margin: 0 }}>
              Open Position — {selectedProduct.name} ({selectedProduct.ticker})
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedTicker(null)}>Cancel</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
            <button
              onClick={() => setSide('long')}
              style={{ padding: 10, borderRadius: 8, fontWeight: 700, fontSize: 13, background: side === 'long' ? '#00e676' : 'var(--surface)', color: side === 'long' ? '#000' : 'var(--text2)' }}
            >
              ▲ LONG
            </button>
            <button
              onClick={() => setSide('short')}
              style={{ padding: 10, borderRadius: 8, fontWeight: 700, fontSize: 13, background: side === 'short' ? 'var(--red)' : 'var(--surface)', color: side === 'short' ? '#fff' : 'var(--text2)' }}
            >
              ▼ SHORT
            </button>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Contracts</label>
              <input
                type="number"
                min={1}
                style={{ width: '100%' }}
                value={contracts}
                onChange={e => setContracts(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14, padding: '10px 14px', background: 'var(--bg3)', borderRadius: 'var(--radius)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text3)' }}>Entry Price</span>
              <span>${entryPrice.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text3)' }}>Margin per Contract</span>
              <span>${selectedProduct.marginPerContract.toLocaleString()}</span>
            </div>
            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span style={{ color: 'var(--text2)' }}>Margin Required</span>
              <span style={{ color: 'var(--gr)', fontSize: 15 }}>
                ${marginRequired.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12 }}>
            Leveraged: each $1 move in price changes this position's value by ${selectedProduct.multiplier.toLocaleString()} per contract.
            Losses are capped at the margin posted.
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
            onClick={handleOpenPosition}
            disabled={trading}
            style={{
              width: '100%', padding: 12, fontSize: 13, fontWeight: 700, border: 'none', borderRadius: 8,
              background: side === 'long' ? '#00e676' : 'var(--red)', color: side === 'long' ? '#000' : '#fff',
              cursor: trading ? 'default' : 'pointer', opacity: trading ? 0.6 : 1,
            }}
          >
            {trading ? 'Placing Order...' : `${side === 'long' ? 'Buy (Long)' : 'Sell (Short)'} ${contracts} Contract${contracts > 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      {/* 2c. My positions */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="section-title">My Futures Positions</div>

        {positionsLoading && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text3)', fontSize: 13 }}>Loading positions...</div>
        )}

        {!positionsLoading && positions.filter(p => p.status === 'open').length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text3)', fontSize: 13 }}>
            No open positions. Click a contract above to place a trade.
          </div>
        )}

        {!positionsLoading && positions.filter(p => p.status === 'open').length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ticker</th>
                  <th>Side</th>
                  <th>Contracts</th>
                  <th>Entry Price</th>
                  <th>Current</th>
                  <th>Margin Posted</th>
                  <th>P&amp;L</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {positions.filter(p => p.status === 'open').map(pos => {
                  const currentPrice = getPriceFor(pos.ticker);
                  const hasPrice = currentPrice > 0;
                  const pnl = hasPrice
                    ? (currentPrice - pos.entryPrice) * pos.multiplier * pos.contracts * (pos.side === 'long' ? 1 : -1)
                    : null;
                  return (
                    <tr key={pos.id}>
                      <td style={{ fontWeight: 700, color: 'var(--yellow)' }}>{pos.ticker}</td>
                      <td style={{ textTransform: 'capitalize', color: pos.side === 'long' ? '#00e676' : 'var(--red)' }}>{pos.side}</td>
                      <td>{pos.contracts}</td>
                      <td>${pos.entryPrice.toFixed(2)}</td>
                      <td>{hasPrice ? `$${currentPrice.toFixed(2)}` : '—'}</td>
                      <td>${pos.marginPosted.toLocaleString()}</td>
                      <td style={{ color: pnl === null ? 'var(--text3)' : pnl >= 0 ? '#00e676' : 'var(--red)', fontWeight: 600 }}>
                        {pnl === null ? '—' : `${pnl >= 0 ? '+' : '-'}$${Math.abs(pnl).toFixed(2)}`}
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: 11 }}
                          disabled={!hasPrice}
                          onClick={() => handleClosePosition(pos)}
                        >
                          Close
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

      {/* 3. Concepts grid */}
      <FuturesConceptsGrid />

    </div>
  );
}
