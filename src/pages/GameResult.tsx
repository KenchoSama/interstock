import { useEffect } from 'react';
import { useApp } from '../state/AppContext';
import { ALL_SCENARIOS } from '../data/scenarios';

function getGrade(pct: number): { grade: string; color: string } {
  if (pct >= 93) return { grade: 'A', color: 'var(--gr)' };
  if (pct >= 80) return { grade: 'B', color: 'var(--blue)' };
  if (pct >= 67) return { grade: 'C', color: 'var(--yellow)' };
  if (pct >= 50) return { grade: 'D', color: 'var(--yellow)' };
  return { grade: 'F', color: 'var(--red)' };
}

export default function GameResult() {
  const { state, dispatch } = useApp();
  const { game } = state;
  const score = game.score;
  const total = 15;
  const pct = Math.round((score / total) * 100);
  const isPerfect = score === total;
  const xpEarned = score * 10 + (isPerfect ? 5 : 0);
  const { grade, color: gradeColor } = getGrade(pct);

  useEffect(() => {
    dispatch({ type: 'ADD_XP', amount: xpEarned });
    try {
      const prev = localStorage.getItem('interstock_game_best');
      const best = prev !== null ? parseInt(prev, 10) : 0;
      if (score > best) {
        localStorage.setItem('interstock_game_best', String(score));
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="page-body" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div
        className="game-card"
        style={{ marginBottom: 20, padding: '32px 28px' }}
      >
        <div style={{ fontSize: 48, marginBottom: 8 }}>
          {isPerfect ? '🏆' : score >= 10 ? '🎉' : score >= 7 ? '📈' : '📚'}
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: gradeColor,
            lineHeight: 1,
            marginBottom: 6,
          }}
        >
          {grade}
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: 4,
          }}
        >
          {score} / {total}
        </div>
        <div style={{ fontSize: 15, color: 'var(--text2)', marginBottom: 16 }}>
          {pct}% accuracy
        </div>
        {isPerfect && (
          <div
            className="badge badge-yellow"
            style={{ fontSize: 13, padding: '4px 16px', marginBottom: 16 }}
          >
            Perfect Score!
          </div>
        )}
        <div className="xp-tag" style={{ fontSize: 14, padding: '4px 14px' }}>
          +{xpEarned} XP earned
        </div>
      </div>

      <div className="stats-row" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Correct</div>
          <div className="stat-value" style={{ color: 'var(--gr)' }}>{score}</div>
          <div className="stat-sub up">{pct}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Wrong / Skipped</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>
            {total - score}
          </div>
          <div className="stat-sub dn">{100 - pct}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">XP Earned</div>
          <div className="stat-value" style={{ color: 'var(--yellow)' }}>
            {xpEarned}
          </div>
          <div className="stat-sub">{isPerfect ? 'Includes +5 bonus' : 'Score × 10'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Grade</div>
          <div className="stat-value" style={{ color: gradeColor }}>{grade}</div>
          <div className="stat-sub">{pct >= 70 ? 'Passing' : 'Keep practicing'}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title" style={{ marginBottom: 14 }}>
          Answer Breakdown
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {ALL_SCENARIOS.map((s, i) => {
            const given = game.answers[i] ?? -1;
            const correct = given === s.answer;
            const skipped = given === -1;
            return (
              <div
                key={s.id}
                style={{
                  padding: '12px 0',
                  borderBottom:
                    i < ALL_SCENARIOS.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: skipped
                        ? 'var(--surface2)'
                        : correct
                        ? 'var(--gr-dim)'
                        : 'var(--red-dim)',
                      color: skipped
                        ? 'var(--text3)'
                        : correct
                        ? 'var(--gr)'
                        : 'var(--red)',
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {skipped ? '–' : correct ? '✓' : '✗'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 13,
                        color: 'var(--text)',
                        fontWeight: 500,
                        lineHeight: 1.5,
                        marginBottom: 4,
                      }}
                    >
                      {i + 1}. {s.text}
                    </div>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12 }}>
                      {!skipped && (
                        <span
                          style={{
                            color: correct ? 'var(--gr)' : 'var(--red)',
                          }}
                        >
                          Your answer: {s.options[given]}
                        </span>
                      )}
                      {(!correct || skipped) && (
                        <span style={{ color: 'var(--gr)' }}>
                          Correct: {s.options[s.answer]}
                        </span>
                      )}
                      {skipped && (
                        <span style={{ color: 'var(--text3)' }}>Time expired</span>
                      )}
                    </div>
                  </div>
                  <span
                    className="badge"
                    style={{
                      background: 'var(--surface2)',
                      color: 'var(--text3)',
                      fontSize: 10,
                      flexShrink: 0,
                    }}
                  >
                    {s.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', paddingBottom: 16 }}>
        <button
          className="btn btn-primary"
          onClick={() => dispatch({ type: 'START_GAME' })}
        >
          Play Again
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => dispatch({ type: 'SET_VIEW', view: 'game' })}
        >
          Back to Game Hub
        </button>
      </div>
    </div>
  );
}
