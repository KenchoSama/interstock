import { useState } from 'react';
import { useFuturesQuotes } from '../hooks/useFuturesQuotes';
import { useFuturesLookup } from '../hooks/useFuturesLookup';
import { useApp, isLocked, FUTURES_UNLOCK_XP } from '../state/AppContext';
import { useFuturesPositions, type FuturesPosition } from '../hooks/useFuturesPositions';
import PortfolioSwitcher from '../components/PortfolioSwitcher';
import { supabase } from '../lib/supabase';

// ── Data ─────────────────────────────────────────────────────────────────────
// marginPerContract / multiplier are numeric versions of the margin/contract
// columns below, used to actually price and settle a paper-trading position.
// price/chg/chgPct are just fallback placeholders shown for an instant before
// live quotes load.

const FUTURES_DATA = [
  // Energy
  { name: 'Crude Oil (WTI)',    ticker: 'CL',  price: 78.42,   chg: -0.87,  chgPct: -1.10, exchange: 'NYMEX', margin: '$5,940',  contract: '1,000 bbl',    marginPerContract: 5940,  multiplier: 1000  },
  { name: 'Natural Gas',        ticker: 'NG',  price: 2.184,   chg: 0.042,  chgPct: 1.96,  exchange: 'NYMEX', margin: '$2,310',  contract: '10,000 MMBtu', marginPerContract: 2310,  multiplier: 10000 },
  { name: 'RBOB Gasoline',      ticker: 'RB',  price: 2.15,    chg: 0.01,   chgPct: 0.47,  exchange: 'NYMEX', margin: '$7,500',  contract: '42,000 gal',   marginPerContract: 7500,  multiplier: 42000 },
  { name: 'Heating Oil',        ticker: 'HO',  price: 2.45,    chg: -0.02,  chgPct: -0.81, exchange: 'NYMEX', margin: '$7,200',  contract: '42,000 gal',   marginPerContract: 7200,  multiplier: 42000 },
  { name: 'Brent Crude',        ticker: 'BZ',  price: 82.10,   chg: -0.60,  chgPct: -0.73, exchange: 'ICE',   margin: '$6,200',  contract: '1,000 bbl',    marginPerContract: 6200,  multiplier: 1000  },
  // Metals
  { name: 'Gold',                ticker: 'GC',  price: 2342.60, chg: 8.30,   chgPct: 0.36,  exchange: 'COMEX', margin: '$9,900',  contract: '100 oz',       marginPerContract: 9900,  multiplier: 100   },
  { name: 'Silver',               ticker: 'SI',  price: 68.93,   chg: 0.50,   chgPct: 0.73,  exchange: 'COMEX', margin: '$14,000', contract: '5,000 oz',     marginPerContract: 14000, multiplier: 5000  },
  { name: 'Copper',               ticker: 'HG',  price: 6.71,    chg: 0.03,   chgPct: 0.45,  exchange: 'COMEX', margin: '$6,500',  contract: '25,000 lbs',   marginPerContract: 6500,  multiplier: 25000 },
  { name: 'Platinum',             ticker: 'PL',  price: 1871.70, chg: -5.00,  chgPct: -0.27, exchange: 'COMEX', margin: '$3,200',  contract: '50 oz',        marginPerContract: 3200,  multiplier: 50    },
  { name: 'Palladium',            ticker: 'PA',  price: 1150.00, chg: 3.00,   chgPct: 0.26,  exchange: 'COMEX', margin: '$15,000', contract: '100 oz',       marginPerContract: 15000, multiplier: 100   },
  // Grains
  { name: 'Corn',                  ticker: 'ZC',  price: 452.25,  chg: -3.50,  chgPct: -0.77, exchange: 'CBOT',  margin: '$1,650',  contract: '5,000 bu',     marginPerContract: 1650,  multiplier: 50    },
  { name: 'Wheat',                 ticker: 'ZW',  price: 704.50,  chg: 2.00,   chgPct: 0.28,  exchange: 'CBOT',  margin: '$2,200',  contract: '5,000 bu',     marginPerContract: 2200,  multiplier: 50    },
  { name: 'Soybeans',              ticker: 'ZS',  price: 1238.75, chg: -4.00,  chgPct: -0.32, exchange: 'CBOT',  margin: '$3,500',  contract: '5,000 bu',     marginPerContract: 3500,  multiplier: 50    },
  { name: 'Soybean Meal',          ticker: 'ZM',  price: 385.00,  chg: 1.20,   chgPct: 0.31,  exchange: 'CBOT',  margin: '$2,200',  contract: '100 tons',     marginPerContract: 2200,  multiplier: 100   },
  { name: 'Soybean Oil',           ticker: 'ZL',  price: 44.50,   chg: 0.20,   chgPct: 0.45,  exchange: 'CBOT',  margin: '$2,000',  contract: '60,000 lbs',   marginPerContract: 2000,  multiplier: 600   },
  // Softs
  { name: 'Coffee',                 ticker: 'KC',  price: 334.85,  chg: -1.50,  chgPct: -0.45, exchange: 'ICE',   margin: '$9,500',  contract: '37,500 lbs',   marginPerContract: 9500,  multiplier: 375   },
  { name: 'Sugar #11',              ticker: 'SB',  price: 19.50,   chg: 0.10,   chgPct: 0.52,  exchange: 'ICE',   margin: '$1,400',  contract: '112,000 lbs',  marginPerContract: 1400,  multiplier: 1120  },
  { name: 'Cotton',                 ticker: 'CT',  price: 71.20,   chg: -0.30,  chgPct: -0.42, exchange: 'ICE',   margin: '$2,700',  contract: '50,000 lbs',   marginPerContract: 2700,  multiplier: 500   },
  { name: 'Cocoa',                  ticker: 'CC',  price: 9800.00, chg: 50.00,  chgPct: 0.51,  exchange: 'ICE',   margin: '$8,500',  contract: '10 tons',      marginPerContract: 8500,  multiplier: 10    },
  // Livestock
  { name: 'Live Cattle',            ticker: 'LE',  price: 195.00,  chg: 0.50,   chgPct: 0.26,  exchange: 'CME',   margin: '$3,300',  contract: '40,000 lbs',   marginPerContract: 3300,  multiplier: 400   },
  { name: 'Lean Hogs',              ticker: 'HE',  price: 89.00,   chg: -0.40,  chgPct: -0.45, exchange: 'CME',   margin: '$2,000',  contract: '40,000 lbs',   marginPerContract: 2000,  multiplier: 400   },
  { name: 'Feeder Cattle',          ticker: 'GF',  price: 265.00,  chg: 1.00,   chgPct: 0.38,  exchange: 'CME',   margin: '$6,000',  contract: '50,000 lbs',   marginPerContract: 6000,  multiplier: 500   },
  // Equity index
  { name: 'S&P 500',                ticker: 'ES',  price: 5218.75, chg: 12.25,  chgPct: 0.24,  exchange: 'CME',   margin: '$13,200', contract: '$50 × Index',  marginPerContract: 13200, multiplier: 50    },
  { name: 'Nasdaq 100',             ticker: 'NQ',  price: 18200,   chg: 40.00,  chgPct: 0.22,  exchange: 'CME',   margin: '$19,800', contract: '$20 × Index',  marginPerContract: 19800, multiplier: 20    },
  { name: 'Dow Jones',              ticker: 'YM',  price: 39500,   chg: -30.00, chgPct: -0.08, exchange: 'CME',   margin: '$8,800',  contract: '$5 × Index',   marginPerContract: 8800,  multiplier: 5     },
  { name: 'Russell 2000',           ticker: 'RTY', price: 2050,    chg: 5.00,   chgPct: 0.24,  exchange: 'CME',   margin: '$6,500',  contract: '$50 × Index',  marginPerContract: 6500,  multiplier: 50    },
  // Rates
  { name: '30-Year T-Bond',         ticker: 'ZB',  price: 118.50,  chg: 0.15,   chgPct: 0.13,  exchange: 'CBOT',  margin: '$3,800',  contract: '$1,000 face × pts', marginPerContract: 3800, multiplier: 1000 },
  { name: '10-Year T-Note',         ticker: 'ZN',  price: 110.20,  chg: 0.08,   chgPct: 0.07,  exchange: 'CBOT',  margin: '$1,900',  contract: '$1,000 face × pts', marginPerContract: 1900, multiplier: 1000 },
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
    lookupClear();
  }

  const [searchInput, setSearchInput] = useState('');
  const { result: lookupResult, loading: lookupLoading, error: lookupError, lookup, clear: lookupClear } = useFuturesLookup();

  function handleSearch() {
    const root = searchInput.trim().toUpperCase().replace(/=F$/, '');
    if (!root) return;

    const known = FUTURES_DATA.find(f => f.ticker === root);
    if (known) {
      selectContract(known.ticker);
      setSearchInput('');
      return;
    }

    lookup(root);
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

  if (isLocked('futures', user.xp)) {
    return (
      <div className="page-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div className="empty-state">
          <div className="empty-state-icon">🔒</div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Futures License Required</div>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>
            Reach {FUTURES_UNLOCK_XP.toLocaleString()} XP to unlock futures trading.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-body">

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <PortfolioSwitcher />
      </div>

      {/* 1. Tip banner */}
      <FuturesTipBanner />

      {/* 1b. Search any futures contract */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 10 }}>Search a Contract</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type="text"
            placeholder="Root ticker — e.g. SI (Silver), HG (Copper), 6E (Euro FX)"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value.toUpperCase())}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
            style={{ flex: 1, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}
          />
          <button
            onClick={handleSearch}
            disabled={lookupLoading}
            style={{ padding: '0 18px', borderRadius: 8, background: 'var(--gr)', color: '#000', fontWeight: 700, fontSize: 12, flexShrink: 0 }}
          >
            {lookupLoading ? '...' : 'Search'}
          </button>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>
          Not every contract we can quote has margin data in our reference table below — those show as a live quote only.
        </div>

        {lookupError && (
          <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 10 }}>{lookupError}</div>
        )}

        {lookupResult && (
          <div style={{
            marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px', background: 'var(--bg3)', borderRadius: 'var(--radius)',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--yellow)' }}>{lookupResult.ticker}=F</span>
                <span style={{ fontSize: 13, color: 'var(--text)' }}>{lookupResult.name}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                Live quote only — no margin/contract-size reference data, so trading isn't available for this one.
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontWeight: 700, fontFamily: 'monospace' }}>
                ${lookupResult.price.toLocaleString('en-US', { minimumFractionDigits: lookupResult.price < 10 ? 3 : 2, maximumFractionDigits: lookupResult.price < 10 ? 3 : 2 })}
              </div>
              <div className={lookupResult.chg >= 0 ? 'up' : 'dn'} style={{ fontSize: 12 }}>
                {lookupResult.chg >= 0 ? '+' : ''}{lookupResult.chgPct.toFixed(2)}%
              </div>
            </div>
          </div>
        )}
      </div>

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
