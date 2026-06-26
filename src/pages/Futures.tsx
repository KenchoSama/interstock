import { useFuturesQuotes } from '../hooks/useFuturesQuotes';

// ── Data ─────────────────────────────────────────────────────────────────────

const FUTURES_DATA = [
  { name: 'Crude Oil',    ticker: 'CL', price: 78.42,   chg: -0.87, chgPct: -1.10, unit: 'bbl',   exchange: 'NYMEX', margin: '$5,940',  contract: '1,000 bbl' },
  { name: 'Gold',         ticker: 'GC', price: 2342.60,  chg:  8.30, chgPct:  0.36, unit: 'oz',    exchange: 'COMEX', margin: '$9,900',  contract: '100 oz'    },
  { name: 'S&P 500',      ticker: 'ES', price: 5218.75,  chg: 12.25, chgPct:  0.24, unit: 'index', exchange: 'CME',   margin: '$13,200', contract: '$50 × Index' },
  { name: 'Corn',         ticker: 'ZC', price: 452.25,   chg: -3.50, chgPct: -0.77, unit: 'bu',    exchange: 'CBOT',  margin: '$1,650',  contract: '5,000 bu'  },
  { name: 'Natural Gas',  ticker: 'NG', price: 2.184,    chg:  0.042, chgPct: 1.96, unit: 'MMBtu', exchange: 'NYMEX', margin: '$2,310',  contract: '10,000 MMBtu' },
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

const HEDGING_EXAMPLES = [
  {
    title: 'Corn Farmer',
    icon: '🌽',
    scenario: 'Planting Season Hedge',
    description: 'A corn farmer plants 100,000 bushels in spring and worries corn prices will fall by harvest. The farmer shorts corn futures at $4.50/bu. If prices fall to $3.80 at harvest, the futures gain offsets the lower cash price — locking in $4.50/bu regardless.',
    benefit: 'Price certainty for planning and operations',
    risk: 'Misses out if corn prices rise significantly',
  },
  {
    title: 'Airline Company',
    icon: '✈️',
    scenario: 'Fuel Cost Hedge',
    description: 'An airline needing 10M gallons of jet fuel longs crude oil futures at $78/barrel. If oil rises to $95, the futures gain offsets higher fuel costs. This is why airlines report "hedging gains" during oil price spikes.',
    benefit: 'Predictable operating costs, easier financial planning',
    risk: 'If oil falls, the airline pays more than market price',
  },
  {
    title: 'Investment Fund',
    icon: '🏦',
    scenario: 'Portfolio Hedge (S&P 500)',
    description: 'A fund manager holding $50M in US stocks shorts S&P 500 futures before an uncertain macro event. If the market falls 5%, futures gains offset portfolio losses — without selling positions.',
    benefit: 'Downside protection without liquidating positions',
    risk: 'Reduces upside if market rallies instead',
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

function FuturesContractsTable({ data }: { data: typeof FUTURES_DATA }) {
  const { quotes, loading } = useFuturesQuotes();

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
        return (
          <div key={f.ticker} style={{
            display: 'flex', alignItems: 'center', fontSize: 12,
            borderBottom: '1px solid rgba(30,58,80,0.5)',
            padding: '6px 0',
          }}>
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
  return (
    <div className="page-body">

      {/* 1. Tip banner */}
      <FuturesTipBanner />

      {/* 2. Contracts table */}
      <FuturesContractsTable data={FUTURES_DATA} />

      {/* 3. Concepts grid */}
      <FuturesConceptsGrid />

      {/* 4. What are futures */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title">What Are Futures?</div>
        <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 16 }}>
          A futures contract is a legal agreement to buy or sell a specific commodity or financial asset at a predetermined price at a specified time in the future. Both parties are obligated to fulfill the contract — unlike options, where the buyer has a choice.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { icon: '📦', label: 'Standardized', desc: 'Each contract specifies exact quantity, quality, and delivery terms set by the exchange.' },
            { icon: '🔄', label: 'Two-Sided',    desc: 'Every futures buyer (long) is matched with a seller (short). One profits while the other loses.' },
            { icon: '🏛️', label: 'Exchange-Traded', desc: 'Traded on regulated exchanges like CME, NYMEX, and CBOT with central clearing for safety.' },
          ].map(item => (
            <div key={item.label} style={{ background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: '14px 16px' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Hedging examples */}
      <div className="section-title">Hedging Examples</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {HEDGING_EXAMPLES.map(ex => (
          <div key={ex.title} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 32 }}>{ex.icon}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{ex.title}</div>
                <span className="badge badge-blue" style={{ marginTop: 4 }}>{ex.scenario}</span>
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 14 }}>{ex.description}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ padding: '10px 14px', background: 'var(--gr-dim)', borderRadius: 'var(--radius)', border: '1px solid rgba(0,212,168,0.2)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gr)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Benefit</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{ex.benefit}</div>
              </div>
              <div style={{ padding: '10px 14px', background: 'var(--red-dim)', borderRadius: 'var(--radius)', border: '1px solid rgba(255,77,109,0.2)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Trade-off</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{ex.risk}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
