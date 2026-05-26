import { useApp } from '../state/AppContext';
import { ALL_SCENARIOS } from '../data/scenarios';

const CATEGORY_COLORS: Record<string, string> = {
  'Market Psychology': 'var(--yellow)',
  'Risk Management': 'var(--red)',
  'Macro Economics': 'var(--blue)',
  'Fundamental Analysis': 'var(--gr)',
  'Technical Analysis': 'var(--gr2)',
  'Trading Mechanics': 'var(--yellow)',
  'Investing Strategy': 'var(--blue)',
  'Options': 'var(--red)',
  'Corporate Actions': 'var(--gr)',
  'Risk Analysis': 'var(--yellow)',
};

const DIFFICULTY_LEVELS = [
  { label: 'Beginner', color: 'var(--gr)', desc: 'Market basics, definitions' },
  { label: 'Intermediate', color: 'var(--yellow)', desc: 'Analysis, strategy' },
  { label: 'Advanced', color: 'var(--red)', desc: 'Complex mechanics, options' },
];

function getBestScore(): number | null {
  try {
    const v = localStorage.getItem('interstock_game_best');
    return v !== null ? parseInt(v, 10) : null;
  } catch {
    return null;
  }
}

export default function GameHome() {
  const { dispatch } = useApp();
  const bestScore = getBestScore();

  const categories = ALL_SCENARIOS.reduce<Record<string, number>>((acc, s) => {
    acc[s.category] = (acc[s.category] ?? 0) + 1;
    return acc;
  }, {});

  function handleStart() {
    dispatch({ type: 'START_GAME' });
  }

  return (
    <div className="page-body" style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', padding: '32px 0 24px' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
          Scenario Challenge
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text2)', maxWidth: 480, margin: '0 auto 24px' }}>
          15 real-world market scenarios. 120 seconds each. How well do you know the markets?
        </p>
        <button
          className="btn btn-primary btn-lg"
          onClick={handleStart}
          style={{ minWidth: 200, fontSize: 16 }}
        >
          Start Challenge →
        </button>
      </div>

      <div className="stats-row" style={{ marginTop: 28 }}>
        <div className="stat-card">
          <div className="stat-label">Best Score</div>
          <div className="stat-value" style={{ color: 'var(--gr)' }}>
            {bestScore !== null ? `${bestScore}/15` : '--'}
          </div>
          <div className="stat-sub">
            {bestScore !== null
              ? `${Math.round((bestScore / 15) * 100)}% accuracy`
              : 'No games played yet'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Questions</div>
          <div className="stat-value">15</div>
          <div className="stat-sub">Scenarios</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Time Limit</div>
          <div className="stat-value">120s</div>
          <div className="stat-sub">Per question</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">XP Reward</div>
          <div className="stat-value" style={{ color: 'var(--yellow)' }}>150</div>
          <div className="stat-sub">Up to 150 XP</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 16, marginTop: 16 }}>
        <div className="card">
          <div className="card-title">Difficulty Legend</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DIFFICULTY_LEVELS.map(d => (
              <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: d.color,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <span style={{ fontWeight: 600, color: d.color, fontSize: 13 }}>{d.label}</span>
                  <span style={{ color: 'var(--text3)', fontSize: 12, marginLeft: 6 }}>{d.desc}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div className="card-title">XP Breakdown</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text2)' }}>Per correct answer</span>
                <span className="xp-tag">+10 XP</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text2)' }}>Perfect score bonus</span>
                <span className="xp-tag">+5 XP</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text2)' }}>Maximum possible</span>
                <span className="xp-tag">+150 XP</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Category Breakdown</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(categories).map(([cat, count]) => {
              const pct = Math.round((count / ALL_SCENARIOS.length) * 100);
              const color = CATEGORY_COLORS[cat] ?? 'var(--gr)';
              return (
                <div key={cat}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 12,
                      marginBottom: 3,
                    }}
                  >
                    <span style={{ color: 'var(--text2)' }}>{cat}</span>
                    <span style={{ color: 'var(--text3)' }}>
                      {count}Q
                    </span>
                  </div>
                  <div
                    style={{
                      height: 4,
                      background: 'var(--surface2)',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: color,
                        borderRadius: 2,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div
        className="card"
        style={{ marginTop: 16, background: 'var(--gr-dim)', border: '1px solid var(--gr2)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 24 }}>💡</div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--gr)', marginBottom: 2 }}>Pro Tips</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
              Read each question carefully. You have 120 seconds per scenario — take your time.
              Explanations are shown after each answer to help you learn. Your score is saved locally.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
