import { useEffect } from 'react';
import { useApp } from '../state/AppContext';
import { ALL_SCENARIOS } from '../data/scenarios';

function resultEmoji(pct: number): string {
  if (pct >= 80) return '🏆';
  if (pct >= 50) return '⭐';
  return '📚';
}

function resultLabel(pct: number): string {
  if (pct >= 80) return 'EXCEPTIONAL!';
  if (pct >= 50) return 'GOOD WORK!';
  return 'KEEP LEARNING!';
}

function resultColor(pct: number): string {
  if (pct >= 80) return 'var(--gr)';
  if (pct >= 50) return 'var(--blue)';
  return 'var(--yellow)';
}

export default function GameResult() {
  const { state, dispatch } = useApp();
  const { game } = state;
  const score    = game.score;
  const total    = ALL_SCENARIOS.length;
  const pct      = Math.round((score / total) * 100);
  const isPerfect = score === total;
  const xpEarned  = score * 10 + (isPerfect ? 5 : 0);

  useEffect(() => {
    dispatch({ type: 'ADD_XP', amount: xpEarned });
    try {
      const prev = localStorage.getItem('interstock_game_best');
      const best = prev !== null ? parseInt(prev, 10) : 0;
      if (score > best) localStorage.setItem('interstock_game_best', String(score));
    } catch { /* ignore */ }
  }, []);

  return (
    <div className="page-body" style={{ maxWidth: 560, margin: '0 auto' }}>

      {/* Result hero */}
      <div style={{ textAlign: 'center', padding: '40px 0 32px' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>{resultEmoji(pct)}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: resultColor(pct), marginBottom: 8, fontFamily: 'monospace' }}>
          {resultLabel(pct)}
        </div>
        <div style={{ fontSize: 52, fontWeight: 800, color: 'var(--text)', lineHeight: 1, marginBottom: 6, fontFamily: 'monospace' }}>
          {pct}%
        </div>
        <div style={{ color: 'var(--text3)', marginBottom: 24, fontFamily: 'monospace', fontSize: 13 }}>
          {score}/{total} correct · {xpEarned.toLocaleString()} XP earned
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Correct</div>
          <div className="stat-value">{score}/{total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">XP Earned</div>
          <div className="stat-value" style={{ color: 'var(--gr)' }}>+{xpEarned}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Accuracy</div>
          <div className="stat-value" style={{ color: resultColor(pct) }}>{pct}%</div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 28 }}>
        <button className="btn btn-primary" onClick={() => dispatch({ type: 'START_GAME' })} style={{ padding: '11px 24px' }}>
          🔄 New Round →
        </button>
        <button className="btn btn-secondary" onClick={() => dispatch({ type: 'SET_VIEW', view: 'game' })} style={{ padding: '11px 24px' }}>
          Back to Hub
        </button>
      </div>

      {/* Answer breakdown */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 14 }}>Answer Breakdown</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {ALL_SCENARIOS.map((s, i) => {
            const given   = game.answers[i] ?? -1;
            const correct = given === s.answer;
            const skipped = given === -1;
            return (
              <div key={s.id} style={{ padding: '12px 0', borderBottom: i < ALL_SCENARIOS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    background: skipped ? 'var(--surface2)' : correct ? 'var(--gr-dim)' : 'var(--red-dim)',
                    color: skipped ? 'var(--text3)' : correct ? 'var(--gr)' : 'var(--red)',
                    fontSize: 12, fontWeight: 700,
                  }}>
                    {skipped ? '–' : correct ? '✓' : '✗'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500, lineHeight: 1.5, marginBottom: 4 }}>
                      {i + 1}. {s.text}
                    </div>
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 11 }}>
                      {!skipped && (
                        <span style={{ color: correct ? 'var(--gr)' : 'var(--red)' }}>
                          Your answer: {s.options[given]}
                        </span>
                      )}
                      {(!correct || skipped) && (
                        <span style={{ color: 'var(--gr)' }}>Correct: {s.options[s.answer]}</span>
                      )}
                      {skipped && <span style={{ color: 'var(--text3)' }}>Time expired</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'var(--surface2)', color: 'var(--text3)', flexShrink: 0 }}>
                    {s.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
