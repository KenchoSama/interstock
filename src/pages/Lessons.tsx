import { useState } from 'react';
import { useApp } from '../state/AppContext';

// ── Data ─────────────────────────────────────────────────────────────────────

const LEVEL_2_XP_REQUIRED = 1200;

interface LessonDef {
  id: number;
  mo: number;
  ti: string;
  mn: number;
  xp: number;
  level: 1 | 2;
  content: string;
}

const LESSONS_DEF: LessonDef[] = [
  // Level 1 — Personal Finance & Capital Markets
  {
    id: 1, mo: 1, level: 1, ti: 'How the Stock Market Works', mn: 8, xp: 25,
    content: 'The stock market is a marketplace where buyers and sellers trade shares of publicly listed companies. When a company wants to raise money, it sells ownership stakes called shares through an Initial Public Offering (IPO).\n\nThe two major US exchanges are the NYSE and NASDAQ. Prices change based on supply and demand — when more people want to buy than sell, the price rises.\n\nMarket hours are 9:30 AM to 4:00 PM Eastern, Monday through Friday.\n\nKey players: retail investors, institutional investors (hedge funds, mutual funds), market makers, and the SEC.',
  },
  {
    id: 2, mo: 2, level: 1, ti: 'Reading a Stock Quote', mn: 6, xp: 20,
    content: 'A stock quote gives a snapshot of a stock\'s current status:\n\n• Price: Last traded price\n• Change ($/%): How much the price moved today\n• Open/High/Low: Day\'s trading range\n• 52-Week High/Low: Annual range\n• Volume: Shares traded today\n• Market Cap: Total company value\n• P/E Ratio: Price ÷ Earnings Per Share\n• Dividend Yield: Annual dividend as % of price\n• Beta: Volatility relative to the market',
  },
  {
    id: 3, mo: 3, level: 1, ti: 'Understanding P/E Ratios', mn: 7, xp: 30,
    content: 'The Price-to-Earnings (P/E) ratio answers: how much are you paying for $1 of company earnings?\n\nFormula: P/E = Stock Price ÷ EPS\n\nExample: A stock at $50 with EPS of $2.50 has a P/E of 20.\n\n• Low P/E (< 15): May be undervalued or slow-growth\n• Average P/E (15–25): Fairly valued\n• High P/E (25+): Market expects high future growth\n\nAlways compare to industry peers — context matters.',
  },
  {
    id: 4, mo: 4, level: 1, ti: 'Candlestick Charts', mn: 10, xp: 35,
    content: 'Candlestick charts show 4 data points per period:\n\n• Open: Price at start\n• High: Highest price reached\n• Low: Lowest price reached\n• Close: Price at end\n\nGreen candle = price went up. Red candle = price went down. Wicks show the high and low.\n\nCommon patterns:\n• Doji: Open ≈ Close → indecision\n• Hammer: Long lower wick → potential reversal up\n• Shooting Star: Long upper wick → potential reversal down\n• Engulfing: Large candle swallows previous → strong signal',
  },
  {
    id: 5, mo: 5, level: 1, ti: 'Diversification & Risk', mn: 8, xp: 30,
    content: 'Systematic risk affects all stocks and can\'t be diversified away — recessions, pandemics, interest rate changes.\n\nUnsystematic risk is unique to one company or sector. Holding 20+ uncorrelated stocks nearly eliminates this.\n\nDiversification strategies:\n• Asset classes: Mix stocks, bonds, real estate\n• Sectors: Tech, healthcare, financials, consumer goods\n• Geography: US, international, emerging markets\n• Size: Large-cap stability + small-cap growth\n\nHarry Markowitz proved mathematically that diversification improves risk-adjusted returns.',
  },
  {
    id: 6, mo: 6, level: 1, ti: 'Dollar-Cost Averaging', mn: 6, xp: 25,
    content: 'Dollar-cost averaging (DCA) means investing a fixed amount at regular intervals regardless of market conditions.\n\nWhen prices are HIGH → you buy fewer shares\nWhen prices are LOW → you buy more shares\n\nThis averages your cost basis and removes the pressure of timing the market.\n\nBenefits:\n• Removes emotional decision-making\n• Takes advantage of market dips automatically\n• Builds disciplined habits\n\nWarren Buffett recommends DCA into low-cost index funds for most investors.',
  },
  {
    id: 7, mo: 7, level: 1, ti: 'How Dividends Work', mn: 7, xp: 25,
    content: 'A dividend is a portion of company profits paid to shareholders, typically quarterly.\n\nKey dates:\n• Declaration Date: Company announces the dividend\n• Ex-Dividend Date: Must own shares before this date\n• Record Date: Company checks its books\n• Payment Date: Money arrives in your account\n\nDividend yield = Annual dividend ÷ Stock price × 100\n\nDividend reinvestment (DRIP) automatically buys more shares, compounding returns over time.',
  },
  {
    id: 8, mo: 8, level: 1, ti: 'Introduction to ETFs', mn: 8, xp: 30,
    content: 'An ETF is a basket of securities that trades on an exchange like a stock.\n\nPopular ETFs:\n• SPY / VOO: Track the S&P 500\n• QQQ: Nasdaq 100 (tech-heavy)\n• VTI: Total US stock market\n• BND: US bond market\n• GLD: Gold price\n\nAdvantages over individual stocks:\n• Instant diversification\n• Low fees (as low as 0.03%)\n• Tax efficiency\n• Trade anytime during market hours',
  },
  {
    id: 9, mo: 9, level: 1, ti: 'Bonds & Fixed Income', mn: 7, xp: 25,
    content: 'A bond is a loan you make to a company or government. In return, they pay you regular interest (the coupon) and return the principal at maturity.\n\nKey terms:\n• Face Value: Principal amount ($1,000 typically)\n• Coupon Rate: Annual interest rate\n• Maturity: When the bond expires\n• Yield: Return based on current market price\n\nBond prices move opposite to interest rates — when rates rise, bond prices fall.\n\nBond types: Government (Treasuries), Municipal, Corporate, High-Yield (Junk)',
  },
  {
    id: 10, mo: 10, level: 1, ti: 'Understanding Market Cycles', mn: 9, xp: 35,
    content: 'Markets move in cycles driven by economic conditions and investor psychology.\n\nThe four phases:\n1. Accumulation: Smart money buys after a downturn. Sentiment is negative.\n2. Markup: Prices rise, public starts buying. Bull market.\n3. Distribution: Smart money sells to enthusiastic retail investors.\n4. Markdown: Prices fall. Bear market. Fear dominates.\n\nEconomic cycles: Expansion → Peak → Recession → Trough\n\nHistorically, the S&P 500 spends more time rising than falling. Long-term investors benefit from staying invested through cycles.',
  },

  // Level 2 — Derivatives & Hedging
  {
    id: 11, mo: 1, level: 2, ti: 'Introduction to Derivatives', mn: 10, xp: 50,
    content: 'Derivatives are financial contracts whose value is derived from an underlying asset — stocks, bonds, commodities, currencies, or indices.\n\nMain types:\n• Options: Right (not obligation) to buy or sell\n• Futures: Obligation to buy or sell at a future date\n• Swaps: Exchange of cash flows between parties\n• Forwards: Customized futures contracts (OTC)\n\nDerivatives serve two main purposes: hedging risk and speculation.',
  },
  {
    id: 12, mo: 2, level: 2, ti: 'Options — Calls & Puts Deep Dive', mn: 12, xp: 60,
    content: 'A call option gives the buyer the right to BUY 100 shares at the strike price before expiry.\nA put option gives the buyer the right to SELL 100 shares at the strike price before expiry.\n\nThe Greeks measure option sensitivity:\n• Delta: Price sensitivity to stock move\n• Gamma: Rate of change of delta\n• Theta: Daily time decay\n• Vega: Sensitivity to volatility\n\nOptions strategies: covered calls, protective puts, straddles, spreads.',
  },
  {
    id: 13, mo: 3, level: 2, ti: 'Futures & Commodities', mn: 10, xp: 50,
    content: 'Futures contracts obligate both parties to transact at a future date and price.\n\nKey concepts:\n• Margin: Small deposit (3–10%) controlling large contract value\n• Leverage: Amplifies gains and losses\n• Contango: Futures price > spot price\n• Backwardation: Futures price < spot price\n• Roll: Close expiring position, open next month\n\nCommon futures: crude oil, gold, S&P 500 (ES), corn, natural gas.',
  },
  {
    id: 14, mo: 4, level: 2, ti: 'Hedging Strategies', mn: 11, xp: 55,
    content: 'Hedging reduces risk by taking an offsetting position.\n\nCommon strategies:\n• Protective Put: Buy a put on stock you own — acts like insurance\n• Covered Call: Sell a call on stock you own — earn premium\n• Futures Hedge: Airlines buying oil futures to lock in fuel costs\n• Portfolio Hedge: Short index futures to offset market exposure\n\nKey insight: Hedging costs money (premium, transaction costs). It\'s about reducing risk, not maximizing profit.',
  },
  {
    id: 15, mo: 5, level: 2, ti: 'Portfolio Risk Management', mn: 12, xp: 60,
    content: 'Risk management is about sizing positions and limiting drawdowns.\n\nCore metrics:\n• Sharpe Ratio: Return per unit of risk\n• Beta: Portfolio sensitivity to market\n• VaR (Value at Risk): Maximum expected loss over a period\n• Max Drawdown: Largest peak-to-trough decline\n\nPosition sizing: Never risk more than 1–2% of capital on a single trade.\n\nAsset allocation: The mix of stocks, bonds, and alternatives determines most of your long-term return and risk.',
  },
];

// ── Status computation ────────────────────────────────────────────────────────

type Status = 'completed' | 'in_progress' | 'locked';

interface Lesson extends LessonDef { st: Status; sc?: number; }

function buildLessons(completedIds: Set<number>, level: 1 | 2, locked: boolean): Lesson[] {
  const defs = LESSONS_DEF.filter(l => l.level === level);
  let foundInProgress = false;
  return defs.map(d => {
    if (locked) return { ...d, st: 'locked' as Status };
    if (completedIds.has(d.id)) return { ...d, st: 'completed' as Status, sc: 100 };
    if (!foundInProgress) { foundInProgress = true; return { ...d, st: 'in_progress' as Status }; }
    return { ...d, st: 'locked' as Status };
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function LevelProgressBar({ label, completed, total, pct, locked = false, barColor = 'linear-gradient(90deg,var(--gr),var(--blue))' }: {
  label: string; completed: number; total: number; pct: number; locked?: boolean; barColor?: string;
}) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{label}</span>
        <span style={{
          fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 600,
          background: locked ? 'var(--surface)' : 'var(--gr-dim)',
          color: locked ? 'var(--text3)' : 'var(--gr)',
        }}>
          {completed}/{total}
        </span>
      </div>
      <div style={{ height: 5, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 3, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
}

const STATUS_STYLE: Record<Status, { bg: string; border: string; color: string }> = {
  completed:   { bg: 'rgba(0,212,168,0.15)', border: 'rgba(0,212,168,0.3)',  color: 'var(--gr)'    },
  in_progress: { bg: 'rgba(77,159,255,0.15)', border: 'rgba(77,159,255,0.4)', color: 'var(--blue)'  },
  locked:      { bg: 'var(--surface)',        border: 'var(--border)',         color: 'var(--text3)' },
};

const STATUS_BADGE: Record<Status, { label: string; color: string; bg: string }> = {
  completed:   { label: '✓ DONE', color: 'var(--gr)',   bg: 'var(--gr-dim)'   },
  in_progress: { label: '▶ NOW',  color: 'var(--blue)', bg: 'var(--blue-dim)' },
  locked:      { label: '🔒',     color: 'var(--text3)', bg: 'var(--surface)'  },
};

function LessonRow({ lesson, onStart, onReview }: {
  lesson: Lesson;
  onStart: (id: number) => void;
  onReview: (id: number) => void;
}) {
  const sc = STATUS_STYLE[lesson.st];
  const sb = STATUS_BADGE[lesson.st];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: '1px solid rgba(30,52,72,0.5)' }}>
      <div style={{
        width: 30, height: 30, borderRadius: 6, flexShrink: 0,
        background: sc.bg, border: `1px solid ${sc.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: sc.color,
      }}>
        {lesson.st === 'completed' ? '✓' : lesson.mo}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: lesson.st === 'locked' ? 'var(--text3)' : 'var(--text)' }}>
          {lesson.ti}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'monospace' }}>
          {lesson.mn} min{lesson.sc ? ` · ${lesson.sc}%` : ''} · +{lesson.xp} XP
        </div>
      </div>

      <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 8, fontWeight: 600, color: sb.color, background: sb.bg }}>
        {sb.label}
      </span>

      {lesson.st !== 'locked' && (
        <button
          className={`btn btn-sm ${lesson.st === 'completed' ? 'btn-secondary' : 'btn-primary'}`}
          onClick={() => lesson.st === 'completed' ? onReview(lesson.id) : onStart(lesson.id)}
        >
          {lesson.st === 'completed' ? 'Review' : 'Start →'}
        </button>
      )}
    </div>
  );
}

function Level1Panel({ lessons, onStart, onReview }: {
  lessons: Lesson[];
  onStart: (id: number) => void;
  onReview: (id: number) => void;
}) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="section-title" style={{ marginBottom: 4 }}>Level 1 — Personal Finance &amp; Capital Markets</div>
      <div style={{ padding: '2px 0' }}>
        {lessons.map(l => (
          <LessonRow key={l.id} lesson={l} onStart={onStart} onReview={onReview} />
        ))}
      </div>
    </div>
  );
}

function Level2Panel({ lessons, locked, studentXp, onStart, onReview }: {
  lessons: Lesson[];
  locked: boolean;
  studentXp: number;
  onStart: (id: number) => void;
  onReview: (id: number) => void;
}) {
  const xpNeeded = LEVEL_2_XP_REQUIRED - studentXp;
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div className="section-title" style={{ margin: 0 }}>Level 2 — Derivatives &amp; Hedging</div>
        {locked && (
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 8, fontWeight: 600, background: 'var(--red-dim)', color: 'var(--red)' }}>
            🔒 UNLOCK AT {LEVEL_2_XP_REQUIRED.toLocaleString()} XP
          </span>
        )}
      </div>
      <div style={{ opacity: locked ? 0.35 : 1 }}>
        {locked && (
          <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'monospace', padding: '6px 0 10px' }}>
            Earn {xpNeeded.toLocaleString()} more XP to unlock Level 2.
          </div>
        )}
        {lessons.map(l => (
          locked
            ? (
              <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid rgba(30,52,72,0.4)' }}>
                <div style={{ width: 30, height: 30, borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: 11, flexShrink: 0, color: 'var(--text3)' }}>
                  {l.mo}
                </div>
                <div style={{ flex: 1, fontSize: 12, color: 'var(--text3)' }}>{l.ti}</div>
                <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 8, background: 'var(--surface)', color: 'var(--text3)' }}>🔒</span>
              </div>
            )
            : <LessonRow key={l.id} lesson={l} onStart={onStart} onReview={onReview} />
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Lessons() {
  const { state, dispatch } = useApp();
  const user = state.u[state.role];
  const studentXp = user.xp;

  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());
  const [activeId, setActiveId] = useState<number | null>(null);

  const level2Locked = studentXp < LEVEL_2_XP_REQUIRED;

  const level1Lessons = buildLessons(completedIds, 1, false);
  const level2Lessons = buildLessons(completedIds, 2, level2Locked);

  const l1Completed = level1Lessons.filter(l => l.st === 'completed').length;
  const l2Completed = level2Lessons.filter(l => l.st === 'completed').length;
  const l1Pct = Math.round((l1Completed / level1Lessons.length) * 100);
  const l2Pct = level2Locked ? 0 : Math.round((l2Completed / level2Lessons.length) * 100);

  function handleStart(id: number)  { setActiveId(id); }
  function handleReview(id: number) { setActiveId(id); }

  function completeLesson(lesson: LessonDef) {
    if (!completedIds.has(lesson.id)) {
      setCompletedIds(prev => new Set([...prev, lesson.id]));
      dispatch({ type: 'ADD_XP', amount: lesson.xp });
    }
    setActiveId(null);
  }

  // Lesson reader view
  if (activeId !== null) {
    const lesson = LESSONS_DEF.find(l => l.id === activeId)!;
    const done = completedIds.has(lesson.id);
    return (
      <div>
        <div className="page-header">
          <div>
            <div className="page-title">{lesson.ti}</div>
            <div className="page-subtitle">Level {lesson.level} · {lesson.mn} min · +{lesson.xp} XP</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveId(null)}>← Back to Lessons</button>
        </div>
        <div className="page-body">
          <div className="card" style={{ maxWidth: 720 }}>
            <div style={{ whiteSpace: 'pre-line', lineHeight: 1.8, fontSize: 15, color: 'var(--text)' }}>
              {lesson.content}
            </div>
            <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="xp-tag">+{lesson.xp} XP</span>
              <button className="btn btn-primary" onClick={() => completeLesson(lesson)}>
                {done ? '✓ Completed' : 'Mark Complete & Earn XP'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-body">

      {/* Progress bars */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <LevelProgressBar
          label="Level 1: Personal Finance"
          completed={l1Completed}
          total={level1Lessons.length}
          pct={l1Pct}
          barColor="linear-gradient(90deg,var(--gr),var(--blue))"
        />
        <LevelProgressBar
          label="Level 2: Derivatives"
          completed={l2Completed}
          total={level2Lessons.length}
          pct={l2Pct}
          locked={level2Locked}
          barColor="var(--blue)"
        />
      </div>

      {/* Level 1 panel */}
      <Level1Panel lessons={level1Lessons} onStart={handleStart} onReview={handleReview} />

      {/* Level 2 panel */}
      <Level2Panel
        lessons={level2Lessons}
        locked={level2Locked}
        studentXp={studentXp}
        onStart={handleStart}
        onReview={handleReview}
      />

    </div>
  );
}
