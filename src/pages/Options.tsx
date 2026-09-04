import { useMemo, useRef, useState, useEffect } from 'react';
import { STOCKS } from '../data/stocks';
import { useStockQuotes } from '../hooks/useStockQuotes';
import { useStockLookup } from '../hooks/useStockLookup';
import { useApp, isLocked, OPTIONS_UNLOCK_XP } from '../state/AppContext';
import { useOptionPositions, type OptionPosition } from '../hooks/useOptionPositions';
import { useOptionOrders } from '../hooks/useOptionOrders';
import PortfolioSwitcher from '../components/PortfolioSwitcher';
import { supabase } from '../lib/supabase';

type StrikeCount = 15 | 25 | 50 | 'all';
const STRIKE_COUNT_OPTIONS: StrikeCount[] = [15, 25, 50, 'all'];

// ── Pricing model (Black-Scholes, no dividend) ─────────────────────────────

function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

function normCdf(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

function blackScholes(spot: number, strike: number, tYears: number, iv: number, r = 0.045): { call: number; put: number } {
  if (tYears <= 0 || iv <= 0) {
    return { call: Math.max(0, spot - strike), put: Math.max(0, strike - spot) };
  }
  const d1 = (Math.log(spot / strike) + (r + (iv * iv) / 2) * tYears) / (iv * Math.sqrt(tYears));
  const d2 = d1 - iv * Math.sqrt(tYears);
  const call = spot * normCdf(d1) - strike * Math.exp(-r * tYears) * normCdf(d2);
  const put = strike * Math.exp(-r * tYears) * normCdf(-d2) - spot * normCdf(-d1);
  return { call: Math.max(0.01, call), put: Math.max(0.01, put) };
}

// Simple volatility smile: further from the money (and especially downside
// puts, matching real skew) carries more implied vol than at-the-money.
function impliedVolFor(strike: number, spot: number, baseIv: number): number {
  const moneyness = (strike - spot) / spot;
  return baseIv + Math.abs(moneyness) * 0.6 + (moneyness < 0 ? Math.abs(moneyness) * 0.3 : 0);
}

function strikeIncrement(spot: number): number {
  if (spot < 25) return 1;
  if (spot < 100) return 2.5;
  if (spot < 250) return 5;
  return 10;
}

// Deterministic per-(ticker,date,strike) pseudo-random source, so volume/OI
// stay stable across re-renders instead of jumping every time a live quote
// ticks in.
function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822519);
    h = Math.imul(h ^ (h >>> 13), 3266489917);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function fairValue(spot: number, strike: number, expiryDate: string, optionType: 'call' | 'put', baseIv = 0.3): number {
  const days = Math.max(0, (new Date(expiryDate + 'T00:00:00').getTime() - Date.now()) / 86400000);
  const iv = impliedVolFor(strike, spot, baseIv);
  const { call, put } = blackScholes(spot, strike, days / 365, iv);
  return optionType === 'call' ? call : put;
}

// ── Expiration dates ────────────────────────────────────────────────────────
// Next several weekly Fridays, then monthly (third-Friday) dates further out —
// mirrors how a real chain front-loads near-term expirations.

interface Expiration {
  date: string;
  label: string;
  daysOut: number;
}

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function thirdFriday(year: number, month: number): Date {
  const first = new Date(year, month, 1);
  const firstFriday = 1 + ((5 - first.getDay() + 7) % 7);
  return new Date(year, month, firstFriday + 14);
}

function generateExpirations(): Expiration[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dates = new Map<string, Date>();

  // Next 6 weekly Fridays
  const friday = new Date(today);
  const untilFriday = (5 - friday.getDay() + 7) % 7;
  friday.setDate(friday.getDate() + (untilFriday === 0 ? 7 : untilFriday));
  for (let i = 0; i < 6; i++) {
    const d = new Date(friday);
    d.setDate(d.getDate() + i * 7);
    dates.set(fmtDate(d), d);
  }

  // Next 4 monthly (third-Friday) expirations after that
  let y = today.getFullYear();
  let m = today.getMonth();
  let added = 0;
  while (added < 4) {
    m += 1;
    if (m > 11) { m = 0; y += 1; }
    const d = thirdFriday(y, m);
    if (d > today) {
      dates.set(fmtDate(d), d);
      added++;
    }
  }

  return Array.from(dates.values())
    .sort((a, b) => a.getTime() - b.getTime())
    .map(d => ({
      date: fmtDate(d),
      label: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      daysOut: Math.round((d.getTime() - today.getTime()) / 86400000),
    }));
}

// ── Chain rows ───────────────────────────────────────────────────────────────

interface OptionRow {
  k: number;
  cLast: number; cChg: number; cBid: number; cAsk: number; cVol: number; cOi: number;
  pLast: number; pChg: number; pBid: number; pAsk: number; pVol: number; pOi: number;
}

function buildChainForDate(ticker: string, exp: Expiration, spot: number, todaysChg: number, strikeCount: StrikeCount): OptionRow[] {
  const inc = strikeIncrement(spot);
  const atm = Math.round(spot / inc) * inc;
  const n = strikeCount === 'all' ? 101 : strikeCount;
  const half = Math.floor(n / 2);
  const strikes = Array.from({ length: n }, (_, i) => atm + (i - half) * inc).filter(k => k > 0);
  const yesterdaySpot = Math.max(0.01, spot - todaysChg);
  const yesterdayT = Math.max(0, exp.daysOut + 1) / 365;
  const T = exp.daysOut / 365;

  return strikes.map(k => {
    const iv = impliedVolFor(k, spot, 0.3);
    const { call, put } = blackScholes(spot, k, T, iv);
    const y = blackScholes(yesterdaySpot, k, yesterdayT, iv);

    const rand = seededRandom(`${ticker}-${exp.date}-${k}`);
    const distFactor = Math.max(0.15, 1 - Math.abs(k - spot) / (spot * 0.15));
    const cVol = Math.round(3000 * distFactor + rand() * 1500);
    const cOi = Math.round(12000 * distFactor + rand() * 3000);
    const pVol = Math.round(2800 * distFactor + rand() * 1500);
    const pOi = Math.round(10500 * distFactor + rand() * 3000);

    const cSpread = Math.max(0.02, call * 0.03);
    const pSpread = Math.max(0.02, put * 0.03);

    return {
      k,
      cLast: call, cChg: call - y.call, cBid: Math.max(0.01, call - cSpread), cAsk: call + cSpread, cVol, cOi,
      pLast: put, pChg: put - y.put, pBid: Math.max(0.01, put - pSpread), pAsk: put + pSpread, pVol, pOi,
    };
  });
}

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

function money(n: number): string {
  return n.toFixed(2);
}

function ChangeCell({ chg }: { chg: number }) {
  return (
    <span style={{ color: chg >= 0 ? '#00e676' : 'var(--red)' }}>
      {chg >= 0 ? '+' : ''}{chg.toFixed(2)}
    </span>
  );
}

function ExpirationGroup({
  exp, expanded, onToggle, rows, spotPrice, ticker, selected, onSelect,
}: {
  exp: Expiration;
  expanded: boolean;
  onToggle: () => void;
  rows: OptionRow[];
  spotPrice: number;
  ticker: string;
  selected: { type: 'call' | 'put'; strike: number; expiryDate: string } | null;
  onSelect: (type: 'call' | 'put', strike: number, askPremium: number, exp: Expiration) => void;
}) {
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', background: expanded ? 'var(--surface)' : 'transparent',
          border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 10, color: 'var(--text3)', transform: expanded ? 'rotate(90deg)' : 'none', display: 'inline-block', transition: 'var(--transition)' }}>▶</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{exp.label}</span>
        <span style={{ fontSize: 11, color: 'var(--text3)' }}>({exp.daysOut}d)</span>
      </button>

      {expanded && (
        <div style={{ padding: '0 0 10px' }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', padding: '0 14px 8px' }}>
            Share Price: <strong style={{ color: 'var(--text)' }}>${spotPrice.toFixed(2)}</strong>
            &nbsp;·&nbsp; Click a bid/ask price to buy that contract to open a position.
          </div>
          <div className="table-wrap" style={{ margin: '0 14px', border: 'none' }}>
            <table style={{ fontSize: 11 }}>
              <thead>
                <tr>
                  <th colSpan={6} style={{ textAlign: 'center', color: '#00e676' }}>CALLS</th>
                  <th style={{ textAlign: 'center' }}>STRIKE</th>
                  <th colSpan={6} style={{ textAlign: 'center', color: 'var(--red)' }}>PUTS</th>
                </tr>
                <tr>
                  <th>Last</th><th>Chg</th><th>Bid</th><th>Ask</th><th>Vol</th><th>OI</th>
                  <th style={{ textAlign: 'center' }}></th>
                  <th>Last</th><th>Chg</th><th>Bid</th><th>Ask</th><th>Vol</th><th>OI</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => {
                  const atm = Math.abs(row.k - spotPrice) < strikeIncrement(spotPrice) / 2 + 0.01;
                  const callSelected = selected?.type === 'call' && selected.strike === row.k && selected.expiryDate === exp.date;
                  const putSelected = selected?.type === 'put' && selected.strike === row.k && selected.expiryDate === exp.date;
                  return (
                    <tr key={row.k} style={{ background: atm ? 'rgba(249,199,79,0.07)' : undefined }}>
                      <td>{money(row.cLast)}</td>
                      <td><ChangeCell chg={row.cChg} /></td>
                      <td
                        onClick={() => onSelect('call', row.k, row.cAsk, exp)}
                        title={`Buy 1 ${ticker} $${row.k} Call @ $${money(row.cAsk)} — exp ${exp.label}`}
                        style={{ color: '#00e676', cursor: 'pointer', fontWeight: callSelected ? 700 : 400, textDecoration: callSelected ? 'underline' : 'none' }}
                      >
                        {money(row.cBid)}
                      </td>
                      <td
                        onClick={() => onSelect('call', row.k, row.cAsk, exp)}
                        title={`Buy 1 ${ticker} $${row.k} Call @ $${money(row.cAsk)} — exp ${exp.label}`}
                        style={{ color: '#00e676', cursor: 'pointer', fontWeight: callSelected ? 700 : 400, textDecoration: callSelected ? 'underline' : 'none' }}
                      >
                        {money(row.cAsk)}
                      </td>
                      <td>{row.cVol.toLocaleString()}</td>
                      <td>{row.cOi.toLocaleString()}</td>
                      <td style={{ textAlign: 'center', color: '#ffc107', fontWeight: 700 }}>${row.k}</td>
                      <td>{money(row.pLast)}</td>
                      <td><ChangeCell chg={row.pChg} /></td>
                      <td
                        onClick={() => onSelect('put', row.k, row.pAsk, exp)}
                        title={`Buy 1 ${ticker} $${row.k} Put @ $${money(row.pAsk)} — exp ${exp.label}`}
                        style={{ color: 'var(--red)', cursor: 'pointer', fontWeight: putSelected ? 700 : 400, textDecoration: putSelected ? 'underline' : 'none' }}
                      >
                        {money(row.pBid)}
                      </td>
                      <td
                        onClick={() => onSelect('put', row.k, row.pAsk, exp)}
                        title={`Buy 1 ${ticker} $${row.k} Put @ $${money(row.pAsk)} — exp ${exp.label}`}
                        style={{ color: 'var(--red)', cursor: 'pointer', fontWeight: putSelected ? 700 : 400, textDecoration: putSelected ? 'underline' : 'none' }}
                      >
                        {money(row.pAsk)}
                      </td>
                      <td>{row.pVol.toLocaleString()}</td>
                      <td>{row.pOi.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function OptionsChain({
  expirations, ticker, spotPrice, todaysChg, selected, onSelect, strikeCount, onStrikeCountChange,
}: {
  expirations: Expiration[];
  ticker: string;
  spotPrice: number;
  todaysChg: number;
  selected: { type: 'call' | 'put'; strike: number; expiryDate: string } | null;
  onSelect: (type: 'call' | 'put', strike: number, askPremium: number, exp: Expiration) => void;
  strikeCount: StrikeCount;
  onStrikeCountChange: (n: StrikeCount) => void;
}) {
  const [expandedDate, setExpandedDate] = useState<string | null>(expirations[0]?.date ?? null);

  useEffect(() => {
    setExpandedDate(expirations[0]?.date ?? null);
  }, [ticker]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 14px 4px', flexWrap: 'wrap', gap: 8 }}>
        <div className="section-title" style={{ margin: 0 }}>{ticker} Options Chain — Simulated</div>
        <span style={{ fontSize: 11, padding: '2px 8px', background: 'var(--yellow)', color: '#000', borderRadius: 4, fontWeight: 700 }}>
          EDUCATIONAL ONLY
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px 10px' }}>
        <span style={{ fontSize: 11, color: 'var(--text3)' }}>Strikes:</span>
        {STRIKE_COUNT_OPTIONS.map(n => (
          <button
            key={n}
            onClick={() => onStrikeCountChange(n)}
            style={{
              padding: '3px 10px', fontSize: 11, borderRadius: 6,
              background: strikeCount === n ? 'var(--gr)' : 'var(--surface)',
              color: strikeCount === n ? '#000' : 'var(--text2)',
              fontWeight: strikeCount === n ? 700 : 400,
            }}
          >
            {n === 'all' ? 'All' : n}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 6 }}>
        {expirations.map(exp => {
          const expanded = expandedDate === exp.date;
          return (
            <ExpirationGroup
              key={exp.date}
              exp={exp}
              expanded={expanded}
              onToggle={() => setExpandedDate(expanded ? null : exp.date)}
              rows={expanded ? buildChainForDate(ticker, exp, spotPrice, todaysChg, strikeCount) : []}
              spotPrice={spotPrice}
              ticker={ticker}
              selected={selected}
              onSelect={onSelect}
            />
          );
        })}
      </div>
    </div>
  );
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
  const { workingOrders, placeOrder, cancelOrder, markFilled } = useOptionOrders(user.portfolioId);

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

  const expirations = useMemo(() => generateExpirations(), []);
  const [strikeCount, setStrikeCount] = useState<StrikeCount>(25);

  function getSpotFor(ticker: string): number {
    return quotes.find(q => q.sym === ticker)?.price
      ?? STOCKS.find(s => s.sym === ticker)?.price
      ?? 0;
  }

  // ── Trading ──
  const [selectedContract, setSelectedContract] = useState<{ type: 'call' | 'put'; strike: number; premium: number; expiryDate: string; expiryLabel: string } | null>(null);
  const [tradeContracts, setTradeContracts] = useState(1);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState(0);
  const [trading, setTrading] = useState(false);
  const [tradeMsg, setTradeMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

  function selectContract(type: 'call' | 'put', strike: number, askPremium: number, exp: Expiration) {
    setSelectedContract({ type, strike, premium: askPremium, expiryDate: exp.date, expiryLabel: exp.label });
    setOrderType('market');
    setLimitPrice(askPremium);
    setTradeMsg(null);
  }

  useEffect(() => {
    if (selectedContract) {
      ticketRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedContract]);

  const orderPrice = orderType === 'limit' ? limitPrice : (selectedContract?.premium ?? 0);
  const tradeCost = orderPrice * 100 * tradeContracts;

  async function handleOpenPosition() {
    if (!selectedContract) return;

    if (orderType === 'limit') {
      if (limitPrice <= 0) {
        setTradeMsg({ text: 'Enter a limit price greater than $0.', ok: false });
        return;
      }
      setTrading(true);
      const { error } = await placeOrder({
        ticker: selectedTicker,
        optionType: selectedContract.type,
        strike: selectedContract.strike,
        expiryDate: selectedContract.expiryDate,
        contracts: tradeContracts,
        limitPrice,
      });
      setTrading(false);

      if (error) {
        setTradeMsg({ text: error, ok: false });
        return;
      }
      setTradeMsg({
        text: `Working order placed: buy ${tradeContracts} ${selectedTicker} $${selectedContract.strike} ${selectedContract.type} @ $${limitPrice.toFixed(2)}`,
        ok: true,
      });
      setSelectedContract(null);
      setTradeContracts(1);
      return;
    }

    if (tradeCost > user.cash) {
      setTradeMsg({ text: 'Insufficient cash balance.', ok: false });
      return;
    }

    const expiryDays = Math.max(0, Math.round((new Date(selectedContract.expiryDate + 'T00:00:00').getTime() - Date.now()) / 86400000));

    setTrading(true);
    const { error } = await openPosition({
      ticker: selectedTicker,
      optionType: selectedContract.type,
      strike: selectedContract.strike,
      contracts: tradeContracts,
      premium: selectedContract.premium,
      expiryDays,
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

  async function handleCancelOrder(orderId: string) {
    const { error } = await cancelOrder(orderId);
    if (error) setTradeMsg({ text: error, ok: false });
  }

  // ── Working option order fill-checking ──
  const filling = useRef(false);
  useEffect(() => {
    if (filling.current || workingOrders.length === 0 || !user.portfolioId) return;

    async function checkFills() {
      filling.current = true;
      for (const order of workingOrders) {
        const spot = getSpotFor(order.ticker);
        if (spot === 0) continue;

        const fair = fairValue(spot, order.strike, order.expiryDate, order.optionType);
        const ask = fair + Math.max(0.02, fair * 0.03);
        if (ask > order.limitPrice) continue;

        const cost = ask * 100 * order.contracts;
        if (cost > user.cash) {
          await cancelOrder(order.id);
          setTradeMsg({ text: `Canceled ${order.ticker} $${order.strike} ${order.optionType} limit order — insufficient cash at fill time.`, ok: false });
          continue;
        }

        const expiryDays = Math.max(0, Math.round((new Date(order.expiryDate + 'T00:00:00').getTime() - Date.now()) / 86400000));
        const { error } = await openPosition({
          ticker: order.ticker,
          optionType: order.optionType,
          strike: order.strike,
          contracts: order.contracts,
          premium: ask,
          expiryDays,
        });
        if (error) continue;

        dispatch({ type: 'ADJUST_CASH', amount: -cost });
        dispatch({ type: 'ADD_XP', amount: 10 });
        if (user.supabaseId) await supabase.rpc('increment_xp', { user_id: user.supabaseId, amount: 10 });
        await markFilled(order.id, ask);
        setTradeMsg({ text: `Filled: bought ${order.contracts} ${order.ticker} $${order.strike} ${order.optionType} @ $${ask.toFixed(2)}`, ok: true });
      }
      filling.current = false;
    }

    checkFills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workingOrders, quotes]);

  async function handleClosePosition(pos: OptionPosition) {
    const spot = getSpotFor(pos.ticker);
    if (spot === 0) {
      setTradeMsg({ text: `No live price available for ${pos.ticker} right now. Try again shortly.`, ok: false });
      return;
    }

    const exitPremium = fairValue(spot, pos.strike, pos.expiryDate, pos.optionType);
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

  if (isLocked('options', user.xp)) {
    return (
      <div className="page-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div className="empty-state">
          <div className="empty-state-icon">🔒</div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Options License Required</div>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>
            Reach {OPTIONS_UNLOCK_XP.toLocaleString()} XP to unlock options trading.
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
              {STOCKS.map(s => (
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
                  {s.sym}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 1. Tip banner */}
      <OptionsTipBanner />

      {/* 2. Options chain */}
      <OptionsChain
        expirations={expirations}
        ticker={selectedTicker}
        spotPrice={spotPrice}
        todaysChg={liveChg}
        selected={selectedContract ? { type: selectedContract.type, strike: selectedContract.strike, expiryDate: selectedContract.expiryDate } : null}
        onSelect={selectContract}
        strikeCount={strikeCount}
        onStrikeCountChange={setStrikeCount}
      />

      {/* 2b. Trade ticket */}
      {selectedContract && (
        <div ref={ticketRef} className="card" style={{ marginBottom: 16, border: '1px solid var(--gr)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div className="section-title" style={{ margin: 0 }}>
              Buy to Open — {selectedTicker} ${selectedContract.strike} {selectedContract.type === 'call' ? 'Call' : 'Put'}
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedContract(null)}>Cancel</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 16 }}>
            <button
              onClick={() => setOrderType('market')}
              style={{ padding: 10, borderRadius: 8, background: orderType === 'market' ? '#00e676' : 'var(--surface)', color: orderType === 'market' ? '#000' : 'var(--text2)', fontWeight: 700, fontSize: 13 }}
            >
              Market
            </button>
            <button
              onClick={() => setOrderType('limit')}
              style={{ padding: 10, borderRadius: 8, background: orderType === 'limit' ? '#00e676' : 'var(--surface)', color: orderType === 'limit' ? '#000' : 'var(--text2)', fontWeight: 700, fontSize: 13 }}
            >
              Limit
            </button>
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
              <label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Expiration</label>
              <div style={{ padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}>
                {selectedContract.expiryLabel}
              </div>
            </div>
            {orderType === 'market' ? (
              <div>
                <label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Premium (ask)</label>
                <div style={{ padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
                  ${selectedContract.premium.toFixed(2)}
                </div>
              </div>
            ) : (
              <div>
                <label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Limit Price ($)</label>
                <input
                  type="number"
                  min={0.01}
                  step="0.01"
                  style={{ width: '100%' }}
                  value={limitPrice || ''}
                  onChange={e => setLimitPrice(parseFloat(e.target.value) || 0)}
                />
              </div>
            )}
          </div>

          {orderType === 'limit' && (
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 14, lineHeight: 1.6 }}>
              Fills automatically once the ask drops to or below your limit. Cash is checked at fill time, not when placed.
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, padding: '10px 14px', background: 'var(--bg3)', borderRadius: 'var(--radius)' }}>
            <span style={{ color: 'var(--text2)', fontWeight: 600 }}>{orderType === 'limit' ? 'Max Cost' : 'Total Cost'}</span>
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
            {trading
              ? 'Placing Order...'
              : orderType === 'limit'
              ? `Place Limit Order — ${tradeContracts} Contract${tradeContracts > 1 ? 's' : ''}`
              : `Buy ${tradeContracts} Contract${tradeContracts > 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      {/* 2c. Working option orders */}
      {workingOrders.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="section-title">Working Option Orders</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ticker</th>
                  <th>Type</th>
                  <th>Strike</th>
                  <th>Contracts</th>
                  <th>Limit Price</th>
                  <th>Expiry</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {workingOrders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 700, color: '#ffc107' }}>{o.ticker}</td>
                    <td style={{ textTransform: 'capitalize' }}>{o.optionType}</td>
                    <td>${o.strike}</td>
                    <td>{o.contracts}</td>
                    <td>${o.limitPrice.toFixed(2)}</td>
                    <td style={{ color: 'var(--text3)', fontSize: 11 }}>
                      {new Date(o.expiryDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }} onClick={() => handleCancelOrder(o.id)}>
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                  const currentPremium = hasPrice ? fairValue(spot, pos.strike, pos.expiryDate, pos.optionType) : null;
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
