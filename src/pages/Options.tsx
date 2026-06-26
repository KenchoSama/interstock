import { useMemo, useState, useEffect } from 'react';
import { STOCKS } from '../data/stocks';
import { useStockQuotes } from '../hooks/useStockQuotes';
import { useStockLookup } from '../hooks/useStockLookup';

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

const STRATEGIES = [
  {
    name: 'Covered Call',
    icon: '📞',
    description: 'Own shares of a stock and sell a call option against them. You collect the premium and agree to sell your shares at the strike price if the option is exercised.',
    risk: 'Limited upside beyond strike price',
    reward: 'Premium income + stock appreciation up to strike',
    outlook: 'Neutral to slightly bullish',
  },
  {
    name: 'Protective Put',
    icon: '🛡️',
    description: 'Buy a put option on a stock you already own. Acts like insurance — if the stock falls below the strike price, your put gains value, offsetting the loss.',
    risk: 'Cost of the premium',
    reward: 'Unlimited upside with downside protection',
    outlook: 'Bullish with downside hedge',
  },
  {
    name: 'Iron Condor',
    icon: '🦅',
    description: 'Sell an OTM call spread and an OTM put spread simultaneously. Profits when the underlying stock stays within a defined range.',
    risk: 'Defined maximum loss if stock breaks out of range',
    reward: 'Maximum profit = net premium collected',
    outlook: 'Neutral (range-bound market)',
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

function OptionsChainTable({ chain, spotPrice, ticker }: { chain: OptionRow[]; spotPrice: number; ticker: string }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-title" style={{ margin: 0 }}>{ticker} Options Chain — Simulated</div>
        <span style={{ fontSize: 11, padding: '2px 8px', background: 'var(--yellow)', color: '#000', borderRadius: 4, fontWeight: 700 }}>
          EDUCATIONAL ONLY
        </span>
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
        return (
          <div key={row.k} style={{
            display: 'flex', fontSize: 12,
            borderBottom: '1px solid rgba(30,58,80,0.5)',
            padding: '5px 0',
            background: atm ? 'rgba(249,199,79,0.07)' : 'transparent',
            borderRadius: atm ? 4 : 0,
          }}>
            <span style={{ color: '#00e676', flex: 1, fontFamily: 'monospace' }}>
              {row.cb}/{row.ca}{' '}
              <span style={{ color: 'var(--text3)', fontSize: 10 }}>{row.civ} {row.coi.toLocaleString()}</span>
            </span>
            <span style={{ color: '#ffc107', fontWeight: 700, width: 80, textAlign: 'center' }}>
              ${row.k}
            </span>
            <span style={{ color: 'var(--red)', flex: 1, textAlign: 'right', fontFamily: 'monospace' }}>
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

  const [optionType, setOptionType] = useState<'call' | 'put'>('call');
  const [stockPrice, setStockPrice] = useState(spotPrice);
  const [strikePrice, setStrikePrice] = useState(Math.round(spotPrice / 5) * 5);
  const [premium, setPremium] = useState(5.00);
  const [expiry, setExpiry] = useState(30);

  useEffect(() => {
    setStockPrice(spotPrice);
    setStrikePrice(Math.round(spotPrice / 5) * 5);
  }, [spotPrice]);

  const intrinsicValue = optionType === 'call'
    ? Math.max(0, stockPrice - strikePrice)
    : Math.max(0, strikePrice - stockPrice);
  const timeValue = Math.max(0, premium - intrinsicValue);
  const breakeven = optionType === 'call' ? strikePrice + premium : strikePrice - premium;
  const cost = premium * 100;

  const pnlSvg = useMemo(() => {
    const low  = stockPrice * 0.7;
    const high = stockPrice * 1.3;
    const step = (high - low) / 40;
    const pnl: number[] = [];
    for (let p = low; p <= high; p += step) {
      const iv = optionType === 'call' ? Math.max(0, p - strikePrice) : Math.max(0, strikePrice - p);
      pnl.push(iv - premium);
    }
    const pnlMin = Math.min(...pnl);
    const pnlMax = Math.max(...pnl);
    const range  = pnlMax - pnlMin || 1;
    const W = 400; const H = 140; const pad = 8;
    const w = W - pad * 2; const h = H - pad * 2;
    const pts = pnl.map((v, i) => {
      const x = pad + (i / (pnl.length - 1)) * w;
      const y = pad + h - ((v - pnlMin) / range) * h;
      return `${x},${y}`;
    });
    const zeroY = pad + h - ((0 - pnlMin) / range) * h;
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="${pad}" y1="${zeroY}" x2="${W - pad}" y2="${zeroY}" stroke="rgba(255,255,255,0.1)" stroke-width="1" stroke-dasharray="4,4"/>
      <polyline points="${pts.join(' ')}" fill="none" stroke="#4d9fff" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    </svg>`;
  }, [stockPrice, strikePrice, premium, optionType]);

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
      <OptionsChainTable chain={chain} spotPrice={spotPrice} ticker={selectedTicker} />

      {/* 3. Greeks grid */}
      <GreeksGrid />

      {/* 4. Calculator */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title">Options Calculator</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
          {([
            { label: 'Option Type', el: (
              <select style={{ width: '100%' }} value={optionType} onChange={e => setOptionType(e.target.value as 'call' | 'put')}>
                <option value="call">Call</option>
                <option value="put">Put</option>
              </select>
            )},
            { label: 'Stock Price ($)', el: <input type="number" style={{ width: '100%' }} value={stockPrice} onChange={e => setStockPrice(parseFloat(e.target.value) || 0)} /> },
            { label: 'Strike Price ($)', el: <input type="number" style={{ width: '100%' }} value={strikePrice} onChange={e => setStrikePrice(parseFloat(e.target.value) || 0)} /> },
            { label: 'Premium ($)', el: <input type="number" step="0.01" style={{ width: '100%' }} value={premium} onChange={e => setPremium(parseFloat(e.target.value) || 0)} /> },
            { label: 'Days to Expiry', el: <input type="number" style={{ width: '100%' }} value={expiry} onChange={e => setExpiry(parseInt(e.target.value) || 1)} /> },
          ] as { label: string; el: React.ReactNode }[]).map(f => (
            <div key={f.label}>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>{f.label}</label>
              {f.el}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Intrinsic Value',  value: `$${intrinsicValue.toFixed(2)}`, color: intrinsicValue > 0 ? 'var(--gr)' : 'var(--text3)' },
            { label: 'Time Value',       value: `$${timeValue.toFixed(2)}`,       color: 'var(--blue)'   },
            { label: 'Breakeven Price',  value: `$${breakeven.toFixed(2)}`,       color: 'var(--yellow)' },
            { label: 'Contract Value',   value: `$${cost.toFixed(2)}`,            color: 'var(--text)'   },
          ].map(item => (
            <div key={item.label} style={{ background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{item.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>
            P&amp;L at Expiration — {optionType === 'call' ? 'Call' : 'Put'} Option
          </div>
          <div className="chart-wrap" dangerouslySetInnerHTML={{ __html: pnlSvg }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
            <span>${(stockPrice * 0.7).toFixed(0)}</span>
            <span>Stock Price at Expiration</span>
            <span>${(stockPrice * 1.3).toFixed(0)}</span>
          </div>
        </div>

        <div style={{ marginTop: 12, padding: '12px 14px', background: 'var(--bg3)', borderRadius: 'var(--radius)', fontSize: 13 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, color: 'var(--text2)' }}>
            <div>
              At expiry, {optionType} is{' '}
              <strong style={{ color: intrinsicValue > 0 ? 'var(--gr)' : 'var(--red)' }}>
                {intrinsicValue > 0 ? 'in-the-money (ITM)' : strikePrice === stockPrice ? 'at-the-money (ATM)' : 'out-of-the-money (OTM)'}
              </strong>
            </div>
            <div>
              Max loss: <strong style={{ color: 'var(--red)' }}>${cost.toFixed(2)}</strong> per contract ({expiry} days remaining)
            </div>
          </div>
        </div>
      </div>

      {/* 5. Calls vs Puts reference table */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title">Calls vs. Puts</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                <th style={{ color: 'var(--gr)' }}>Call Option</th>
                <th style={{ color: 'var(--red)' }}>Put Option</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ color: 'var(--text2)' }}>Right to</td>
                <td className="up">Buy shares at strike price</td>
                <td className="dn">Sell shares at strike price</td>
              </tr>
              <tr>
                <td style={{ color: 'var(--text2)' }}>Profit when</td>
                <td className="up">Stock rises above strike + premium</td>
                <td className="dn">Stock falls below strike − premium</td>
              </tr>
              <tr>
                <td style={{ color: 'var(--text2)' }}>Market outlook</td>
                <td className="up">Bullish</td>
                <td className="dn">Bearish</td>
              </tr>
              <tr>
                <td style={{ color: 'var(--text2)' }}>Max loss</td>
                <td>Premium paid</td>
                <td>Premium paid</td>
              </tr>
              <tr>
                <td style={{ color: 'var(--text2)' }}>Max gain</td>
                <td className="up">Unlimited</td>
                <td className="dn">Strike price minus premium</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Strategies */}
      <div className="section-title">Options Strategies</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {STRATEGIES.map(strat => (
          <div key={strat.name} className="card">
            <div style={{ fontSize: 28, marginBottom: 10 }}>{strat.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{strat.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 12 }}>{strat.description}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ color: 'var(--red)', fontWeight: 600, flexShrink: 0 }}>Risk:</span>
                <span style={{ color: 'var(--text2)' }}>{strat.risk}</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ color: 'var(--gr)', fontWeight: 600, flexShrink: 0 }}>Reward:</span>
                <span style={{ color: 'var(--text2)' }}>{strat.reward}</span>
              </div>
              <div style={{ marginTop: 4 }}>
                <span className="badge badge-blue">{strat.outlook}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
