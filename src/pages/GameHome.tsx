import { useApp } from '../state/AppContext';
import { ALL_SCENARIOS } from '../data/scenarios';

const CATEGORY_EMOJI: Record<string, string> = {
  'Market Psychology':   '🧠',
  'Risk Management':     '🛡️',
  'Macro Economics':     '📊',
  'Fundamental Analysis':'🔍',
  'Technical Analysis':  '📈',
  'Trading Mechanics':   '⚙️',
  'Investing Strategy':  '💡',
  'Options':             '📋',
  'Corporate Actions':   '🏢',
  'Risk Analysis':       '⚡',
};

const CATEGORY_COLOR: Record<string, string> = {
  'Market Psychology':   'var(--yellow)',
  'Risk Management':     'var(--red)',
  'Macro Economics':     'var(--blue)',
  'Fundamental Analysis':'var(--gr)',
  'Technical Analysis':  'var(--gr2)',
  'Trading Mechanics':   'var(--yellow)',
  'Investing Strategy':  'var(--blue)',
  'Options':             'var(--red)',
  'Corporate Actions':   'var(--gr)',
  'Risk Analysis':       'var(--yellow)',
};

const HOW_IT_WORKS = [
  { ic: '⏱', t: 'COUNTDOWN TIMER',       d: '120 sec per scenario. Real decisions under pressure.' },
  { ic: '🎲', t: 'ALL 15 SCENARIOS',      d: `${ALL_SCENARIOS.length} real market scenarios — COVID crashes, margin calls, Fed hikes.` },
  { ic: '🔥', t: 'STREAK BONUS',          d: 'Answer correctly in a row for bonus XP on top of your score.' },
  { ic: '🏆', t: 'DIFFICULTY TIERS',      d: 'Easy to advanced — from budgeting basics to arbitrage.' },
];

const XP_TABLE = [
  { l: 'Correct answer',    x: '+10 XP'  },
  { l: 'Perfect score bonus', x: '+5 XP' },
  { l: 'Maximum possible',  x: '+150 XP' },
  { l: 'Wrong answer',      x: '+0 XP'   },
];

function getBestScore(): number | null {
  try {
    const v = localStorage.getItem('interstock_game_best');
    return v !== null ? parseInt(v, 10) : null;
  } catch { return null; }
}

export default function GameHome() {
  const { dispatch } = useApp();
  const bestScore = getBestScore();
  const previews = ALL_SCENARIOS.slice(0, 8);

  return (
    <div className="page-body">
      <div style={{ display: 'flex', gap: 14 }}>

        {/* ── Left column ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Hero panel */}
          <div className="card" style={{ marginBottom: 14, border: '1px solid rgba(0,212,168,0.3)', textAlign: 'center', padding: 28 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--gr)', marginBottom: 6, fontFamily: 'monospace' }}>
              SCENARIO CHALLENGE
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20, maxWidth: 480, margin: '0 auto 20px', lineHeight: 1.65 }}>
              React like a real trader under pressure — {ALL_SCENARIOS.length} real market
              scenarios. COVID crashes, margin calls, CEO fraud, Fed hikes. Live countdown timer.
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Total Scenarios', value: String(ALL_SCENARIOS.length) },
                { label: 'Best Score',      value: bestScore !== null ? `${bestScore}/15` : '--', color: 'var(--gr)' },
                { label: 'Max XP / Round',  value: '150+', color: 'var(--yellow)' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: '10px 8px' }}>
                  <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: s.color ?? 'var(--text)' }}>{s.value}</div>
                </div>
              ))}
            </div>

            <button
              className="btn btn-primary"
              onClick={() => dispatch({ type: 'START_GAME' })}
              style={{ padding: '13px 36px', fontSize: 14, fontWeight: 700 }}
            >
              ▶ START CHALLENGE
            </button>
          </div>

          {/* Scenario preview cards — 4-column grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 9 }}>
            {previews.map(s => {
              const emoji = CATEGORY_EMOJI[s.category] ?? '📌';
              const color = CATEGORY_COLOR[s.category] ?? 'var(--gr)';
              return (
                <div key={s.id} style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: 10,
                }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{emoji}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 6, lineHeight: 1.35 }}>
                    {s.text.substring(0, 36)}…
                  </div>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 6, background: `${color}22`, color, fontWeight: 600 }}>
                    {s.category.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div style={{ width: 258, flexShrink: 0 }}>

          {/* How It Works */}
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="section-title" style={{ marginBottom: 10 }}>How It Works</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {HOW_IT_WORKS.map((item, i) => (
                <div key={item.t} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '9px 0',
                  borderBottom: i < HOW_IT_WORKS.length - 1 ? '1px solid rgba(30,52,72,0.4)' : 'none',
                }}>
                  <div style={{ fontSize: 18, flexShrink: 0 }}>{item.ic}</div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{item.t}</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)' }}>{item.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* XP Per Answer */}
          <div className="card">
            <div className="section-title" style={{ marginBottom: 10 }}>XP Per Answer</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {XP_TABLE.map((row, i) => (
                <div key={row.l} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '6px 0',
                  borderBottom: i < XP_TABLE.length - 1 ? '1px solid rgba(30,52,72,0.4)' : 'none',
                }}>
                  <span style={{ fontSize: 12, color: 'var(--text2)' }}>{row.l}</span>
                  <span style={{ fontSize: 12, color: 'var(--gr)', fontFamily: 'monospace', fontWeight: 600 }}>{row.x}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
