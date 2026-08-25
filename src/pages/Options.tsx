import { useMemo, useState, useEffect } from 'react';
import { STOCKS } from '../data/stocks';
import { useStockQuotes } from '../hooks/useStockQuotes';
import { useStockLookup } from '../hooks/useStockLookup';
import { useApp } from '../state/AppContext';
import { useOptionPositions, type OptionPosition } from '../hooks/useOptionPositions';
import { supabase } from '../lib/supabase';

// ── Data ─────────────────────────────────────────────────────────────────────

interface OptionRow {
  k: number;
  cb: string; ca: string; civ: string; coi: number;
  pb: string; pa: string; piv: string; poi: number;
}

function buildChain(spot: number): OptionRow[] {
  const atm = Math.round(spot / 5) * 5;
  const strikes = [-25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25].map(o => atm + o);
  return strikes.map(k => {
    const d = k - spot;
    const callIntrinsic = Math.max(0, spot - k);
    const putIntrinsic  = Math.max(0, k - spot);
    const tv = Math.max(0.3, 4.5 - Math.abs(d) * 0.08);
    const cBid = Math.max(0.01, callIntrinsic + tv - 0.15).toFixed(2);
    const cAsk = (parseFloat(cBid) + 0.2 + Math.random() * 0.1).toFixed(2);
    const pBid = Math.max(0.01, putIntrinsic  + tv - 0.15).toFixed(2);
    const pAsk = (parseFloat(pBid) + 0.2 + Math.random() * 0.1).toFixed(2);
    const civ  = (0.28 + Math.abs(d) * 0.003 + Math.random() * 0.01).toFixed(0) + '%';
    const piv  = (0.30 + Math.abs(d) * 0.003 + Math.random() * 0.01).toFixed(0) + '%';
    const coi  = Math.round((12000 - Math.abs(d) * 200 + Math.random() * 2000));
    const poi  = Math.round((10000 - Math.abs(d) * 180 + Math.random() * 2000));
    return { k, cb: cBid, ca: cAsk, civ, coi, pb: pBid, pa: pAsk, piv, poi };
  });
}

const GREEKS = [
  {
    name: 'Delta',
    symbol: 'Δ Delta',
    color: '#4d9fff',
    description: 'Rate of change of option price vs. stock price. Calls range 0→1, Puts range −1→0. ATM options have delta ≈ 0.50.',
  },
  {
    name: 'Gamma',
    symbol: 'Γ Gamma',
    color: '#f9c74f',
    description: 'Rate of change of delta itself. Peaks at-the-money. High gamma means delta can shift rapidly as the stock moves.',
  },
  {
    name: 'Theta',
    symbol: 'Θ Theta',
    color: '#ff4d6d',
    description: 'Daily time decay — how much value the option loses each day. Enemy of buyers, friend of sellers. Accelerates near expiry.',
  },
  {
    name: 'Vega',
    symbol: 'ν Vega',
    color: '#00d4a8',
    description: 'Sensitivity to implied volatility (IV). Higher vega means the option\'s price swings more when market volatility changes.',
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function OptionsTipBanner() {
  return (
    <div style={{
      display: 'flex', gap: 10, alignItems: 'flex-start',
      background: 'var(--blue-dim)', border: '1px solid var(--blue)',
      borderRadius: 'var(--radius)', padding: '12px 14px', marginBottom: 16, fontSize: 13,
    }}>
      <span style={{ fontSize: 18 }}>⚡</span>
      <div style={{ color: 'var(--text2)' }}>
        <strong style={{ color: 'var(--text)' }}>Options:</strong>{' '}
        Calls = right to <strong>BUY</strong> at strike. Puts = right to <strong>SELL</strong>.
        Premium = intrinsic + time value. All data below is simulated for educational use only.
      </div>
    </div>
  );
}

function OptionsChainTable({
  chain, spotPrice, ticker, selected, onSelect,
}: {
  chain: OptionRow[];
  spotPrice: number;
  ticker: string;
  selected: { type: 'call' | 'put'; strike: number } | null;
  onSelect: (type: 'call' | 'put', strike: number, askPremium: number) => void;
}) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-title" style={{ margin: 0 }}>{ticker} Options Chain — Simulated</div>
        <span style={{ fontSize: 11, padding: '2px 8px', background: 'var(--yellow)', color: '#000', borderRadius: 4, fontWeight: 700 }}>
          EDUCATIONAL ONLY
        </span>
      </div>

      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>
        Click a bid/ask price to buy that contract to open a position.
      </div>

      {/* Column headers */}
      <div style={{
        display: 'flex', fontSize: 10, fontWeight: 600,
        borderBottom: '1px solid var(--border2)', paddingBottom: 6, marginBottom: 4,
        color: 'var(--text3)', letterSpacing: '0.4px',
      }}>
        <span style={{ flex: 1 }}>CALLS — BID/ASK · IV · OI</span>
        <span style={{ width: 80, textAlign: 'center' }}>STRIKE</span>
        <span style={{ flex: 1, textAlign: 'right' }}>PUTS — BID/ASK · IV · OI</span>
      </div>

      {/* Rows */}
      {chain.map(row => {
        const atm = Math.abs(row.k - spotPrice) < 5;
        const callSelected = selected?.type === 'call' && selected.strike === row.k;
        const putSelected = selected?.type === 'put' && selected.strike === row.k;
        return (
          <div key={row.k} style={{
            display: 'flex', fontSize: 12,
            borderBottom: '1px solid rgba(30,58,80,0.5)',
            padding: '5px 0',
            background: atm ? 'rgba(249,199,79,0.07)' : 'transparent',
            borderRadius: atm ? 4 : 0,
          }}>
            <span
              onClick={() => onSelect('call', row.k, parseFloat(row.ca))}
              title={`Buy 1 ${ticker} $${row.k} Call @ $${row.ca}`}
              style={{
                color: '#00e676', flex: 1, fontFamily: 'monospace', cursor: 'pointer',
                textDecoration: callSelected ? 'underline' : 'none',
                fontWeight: callSelected ? 700 : 400,
              }}
            >
              {row.cb}/{row.ca}{' '}
              <span style={{ color: 'var(--text3)', fontSize: 10 }}>{row.civ} {row.coi.toLocaleString()}</span>
            </span>
            <span style={{ color: '#ffc107', fontWeight: 700, width: 80, textAlign: 'center' }}>
              ${row.k}
            </span>
            <span
              onClick={() => onSelect('put', row.k, parseFloat(row.pa))}
              title={`Buy 1 ${ticker} $${row.k} Put @ $${row.pa}`}
              style={{
                color: 'var(--red)', flex: 1, textAlign: 'right', fontFamily: 'monospace', cursor: 'pointer',
                textDecoration: putSelected ? 'underline' : 'none',
                fontWeight: putSelected ? 700 : 400,
              }}
            >
              {row.pb}/{row.pa}{' '}
              <span style={{ color: 'var(--text3)', fontSize: 10 }}>{row.piv} {row.poi.toLocaleString()}</span>
            </span>
          </div>
        );
      })}

      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text3)' }}>
        Spot: <strong style={{ color: 'var(--text)' }}>${spotPrice.toFixed(2)}</strong>
        &nbsp;·&nbsp; <span style={{ color: 'var(--yellow)' }}>Highlighted</span> rows = at-the-money
      </div>
    </div>
  );
}

function GreeksGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
      {GREEKS.map(g => (
        <div key={g.name} className="card">
          <div style={{ fontSize: 15, fontWeight: 700, color: g.color, marginBottom: 6, fontFamily: 'monospace' }}>
            {g.symbol}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.55 }}>{g.description}</div>
        </div>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Options() {
  const { state, dispatch } = useApp();
  const user = state.u[state.role];
  const { positions, loading: positionsLoading, openPosition, closePosition } = useOptionPositions(user.portfolioId);

  const { quotes } = useStockQuotes();
  const { result, loading: lookupLoading, error: lookupError, lookup, clear } = useStockLookup();
  const [selectedTicker, setSelectedTicker] = useState('AAPL');
  const [searchInput, setSearchInput] = useState('AAPL');

  const baseStock = STOCKS.find(s => s.sym === selectedTicker);
  const liveQuote = quotes.find(q => q.sym === selectedTicker);

  const spotPrice = result?.sym === selectedTicker
    ? result.price
    : liveQuote?.price ?? baseStock?.price ?? 189.84;

  const displayName = result?.sym === selectedTicker
    ? result.name
    : baseStock?.name ?? selectedTicker;

  const liveChg = result?.sym === selectedTicker
    ? result.chg
    : liveQuote?.chg ?? baseStock?.chg ?? 0;

  const liveChgPct = result?.sym === selectedTicker
    ? result.chgPct
    : liveQuote?.chgPct ?? baseStock?.chgPct ?? 0;

  useEffect(() => {
    if (result) {
      setSelectedTicker(result.sym);
      setSearchInput(result.sym);
    }
  }, [result]);

  const chain = useMemo(() => buildChain(spotPrice), [spotPrice]);

  function getSpotFor(ticker: string): number {
    return quotes.find(q => q.sym === ticker)?.price
      ?? STOCKS.find(s => s.sym === ticker)?.price
      ?? 0;
  }

  // ── Trading ──
  const [selectedContract, setSelectedContract] = useState<{ type: 'call' | 'put'; strike: number; premium: number } | null>(null);
  const [tradeContracts, setTradeContracts] = useState(1);
  const [tradeExpiryDays, setTradeExpiryDays] = useState(30);
  const [trading, setTrading] = useState(false);
  const [tradeMsg, setTradeMsg] = useState<{ text: string; ok: boolean } | null>(null);

  function selectContract(type: 'call' | 'put', strike: number, askPremium: number) {
    setSelectedContract({ type, strike, premium: askPremium });
    setTradeMsg(null);
  }

  const tradeCost = selectedContract ? selectedContract.premium * 100 * tradeContracts : 0;

  async function handleOpenPosition() {
    if (!selectedContract) return;
    if (tradeCost > user.cash) {
      setTradeMsg({ text: 'Insufficient cash balance.', ok: false });
      return;
    }

    setTrading(true);
    const { error } = await openPosition({
      ticker: selectedTicker,
      optionType: selectedContract.type,
      strike: selectedContract.strike,
      contracts: tradeContracts,
      premium: selectedContract.premium,
      expiryDays: tradeExpiryDays,
    });
    setTrading(false);

    if (error) {
      setTradeMsg({ text: error, ok: false });
      return;
    }

    dispatch({ type: 'ADJUST_CASH', amount: -tradeCost });
    dispatch({ type: 'ADD_XP', amount: 10 });
    if (user.supabaseId) await supabase.rpc('increment_xp', { user_id: user.supabaseId, amount: 10 });

    setTradeMsg({
      text: `Bought ${tradeContracts} ${selectedTicker} $${selectedContract.strike} ${selectedContract.type} contract${tradeContracts > 1 ? 's' : ''}!`,
      ok: true,
    });
    setSelectedContract(null);
    setTradeContracts(1);
  }

  async function handleClosePosition(pos: OptionPosition) {
    const spot = getSpotFor(pos.ticker);
    if (spot === 0) {
      setTradeMsg({ text: `No live price available for ${pos.ticker} right now. Try again shortly.`, ok: false });
      return;
    }

    const expired = new Date(pos.expiryDate + 'T00:00:00') < new Date();

    let exitPremium: number;
    if (expired) {
      exitPremium = pos.optionType === 'call' ? Math.max(0, spot - pos.strike) : Math.max(0, pos.strike - spot);
    } else {
      const row = buildChain(spot).find(r => r.k === pos.strike);
      exitPremium = row ? parseFloat(pos.optionType === 'call' ? row.cb : row.pb) : 0;
    }

    const proceeds = exitPremium * 100 * pos.contracts;
    const { error } = await closePosition(pos.id, exitPremium);
    if (error) {
      setTradeMsg({ text: error, ok: false });
      return;
    }

    dispatch({ type: 'ADJUST_CASH', amount: proceeds });
    dispatch({ type: 'ADD_XP', amount: 10 });
    if (user.supabaseId) await supabase.rpc('increment_xp', { user_id: user.supabaseId, amount: 10 });

    setTradeMsg({ text: `Closed ${pos.ticker} $${pos.strike} ${pos.optionType} for $${proceeds.toFixed(2)}.`, ok: true });
  }

  return (
    <div className="page-body">

      {/* Stock selector */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 120 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#ffc107' }}>{selectedTicker}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>{displayName}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22, fontWeight: 700 }}>${spotPrice.toFixed(2)}</span>
            <span className={liveChg >= 0 ? 'up' : 'dn'} style={{ fontSize: 13 }}>
              {liveChg >= 0 ? '+' : ''}{liveChg.toFixed(2)} ({liveChgPct.toFixed(2)}%)
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="text"
                placeholder="Search any ticker..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value.toUpperCase())}
                onKeyDown={e => { if (e.key === 'Enter') lookup(searchInput); }}
                style={{ flex: 1, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}
              />
              <button
                onClick={() => lookup(searchInput)}
                disabled={lookupLoading}
                style={{
                  padding: '0 14px', borderRadius: 8,
                  background: 'var(--gr)', color: '#000',
                  fontWeight: 700, fontSize: 12, flexShrink: 0,
                }}
              >
                {lookupLoading ? '...' : 'GO'}
              </button>
            </div>
            {lookupError && (
              <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 5 }}>{lookupError}</div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
              {STOCKS.map(s => {
                const q = quotes.find(q => q.sym === s.sym);
                const price = q?.price ?? s.price;
                return (
                  <button key={s.sym}
                    onClick={() => { setSearchInput(s.sym); setSelectedTicker(s.sym); clear(); }}
                    style={{
                      padding: '2px 8px', fontSize: 10, borderRadius: 4,
                      background: selectedTicker === s.sym ? 'var(--gr-dim)' : 'var(--surface)',
                      border: `1px solid ${selectedTicker === s.sym ? 'var(--gr)' : 'var(--border)'}`,
                      color: selectedTicker === s.sym ? 'var(--gr)' : 'var(--text3)',
                      fontWeight: selectedTicker === s.sym ? 700 : 400,
                      cursor: 'pointer',
                    }}
                  >
                    {s.sym} ${price.toFixed(0)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 1. Tip banner */}
      <OptionsTipBanner />

      {/* 2. Options chain */}
      <OptionsChainTable
        chain={chain}
        spotPrice={spotPrice}
        ticker={selectedTicker}
        selected={selectedContract ? { type: selectedContract.type, strike: selectedContract.strike } : null}
        onSelect={selectContract}
      />

      {/* 2b. Trade ticket */}
      {selectedContract && (
        <div className="card" style={{ marginBottom: 16, border: '1px solid var(--gr)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div className="section-title" style={{ margin: 0 }}>
              Buy to Open — {selectedTicker} ${selectedContract.strike} {selectedContract.type === 'call' ? 'Call' : 'Put'}
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedContract(null)}>Cancel</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Contracts</label>
              <input
                type="number"
                min={1}
                style={{ width: '100%' }}
                value={tradeContracts}
                onChange={e => setTradeContracts(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Expiration (days)</label>
              <select style={{ width: '100%' }} value={tradeExpiryDays} onChange={e => setTradeExpiryDays(parseInt(e.target.value))}>
                {[7, 14, 30, 60, 90].map(d => <option key={d} value={d}>{d} days</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Premium (ask)</label>
              <div style={{ padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
                ${selectedContract.premium.toFixed(2)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, padding: '10px 14px', background: 'var(--bg3)', borderRadius: 'var(--radius)' }}>
            <span style={{ color: 'var(--text2)', fontWeight: 600 }}>Total Cost</span>
            <span style={{ color: 'var(--gr)', fontSize: 18, fontWeight: 700 }}>
              ${tradeCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
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
              background: '#00e676', color: '#000', cursor: trading ? 'default' : 'pointer', opacity: trading ? 0.6 : 1,
            }}
          >
            {trading ? 'Placing Order...' : `Buy ${tradeContracts} Contract${tradeContracts > 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      {/* 2c. My positions */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="section-title">My Option Positions</div>

        {positionsLoading && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text3)', fontSize: 13 }}>Loading positions...</div>
        )}

        {!positionsLoading && positions.filter(p => p.status === 'open').length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text3)', fontSize: 13 }}>
            No open positions. Buy a contract from the chain above to get started.
          </div>
        )}

        {!positionsLoading && positions.filter(p => p.status === 'open').length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ticker</th>
                  <th>Type</th>
                  <th>Strike</th>
                  <th>Contracts</th>
                  <th>Premium Paid</th>
                  <th>Current</th>
                  <th>P&amp;L</th>
                  <th>Expiry</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {positions.filter(p => p.status === 'open').map(pos => {
                  const spot = getSpotFor(pos.ticker);
                  const hasPrice = spot > 0;
                  const expired = new Date(pos.expiryDate + 'T00:00:00') < new Date();
                  const chainRow = hasPrice ? buildChain(spot).find(r => r.k === pos.strike) : undefined;
                  const currentPremium = !hasPrice
                    ? null
                    : expired || !chainRow
                    ? (pos.optionType === 'call' ? Math.max(0, spot - pos.strike) : Math.max(0, pos.strike - spot))
                    : parseFloat(pos.optionType === 'call' ? chainRow.cb : chainRow.pb);
                  const pnl = currentPremium !== null ? (currentPremium - pos.premiumPaid) * 100 * pos.contracts : null;
                  return (
                    <tr key={pos.id}>
                      <td style={{ fontWeight: 700, color: '#ffc107' }}>{pos.ticker}</td>
                      <td style={{ textTransform: 'capitalize' }}>{pos.optionType}</td>
                      <td>${pos.strike}</td>
                      <td>{pos.contracts}</td>
                      <td>${pos.premiumPaid.toFixed(2)}</td>
                      <td>
                        {currentPremium !== null ? `$${currentPremium.toFixed(2)}` : '—'}
                        {expired && <span style={{ color: 'var(--text3)', fontSize: 10 }}> (expired)</span>}
                      </td>
                      <td style={{ color: pnl === null ? 'var(--text3)' : pnl >= 0 ? '#00e676' : 'var(--red)', fontWeight: 600 }}>
                        {pnl === null ? '—' : `${pnl >= 0 ? '+' : '-'}$${Math.abs(pnl).toFixed(2)}`}
                      </td>
                      <td style={{ color: expired ? 'var(--red)' : 'var(--text3)' }}>
                        {new Date(pos.expiryDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td>
                        <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }} onClick={() => handleClosePosition(pos)}>
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

      {/* 3. Greeks grid */}
      <GreeksGrid />

    </div>
  );
}
