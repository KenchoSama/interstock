import { useEffect, useRef, useState } from 'react';
import { useApp } from '../state/AppContext';
import { LEVEL_GAME, calcStars, PASS_THRESHOLD } from '../data/levels';

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

const DIFFICULTY_COLOR: Record<string, string> = {
  easy:   'var(--gr)',
  medium: 'var(--yellow)',
  hard:   'var(--red)',
  expert: 'var(--blue)',
};

function getSavedStars(): Record<number, number> {
  try { return JSON.parse(localStorage.getItem('interstock_level_stars') ?? '{}'); }
  catch { return {}; }
}

function saveStars(levelId: number, stars: number) {
  try {
    const prev = getSavedStars();
    if ((prev[levelId] ?? 0) < stars) {
      prev[levelId] = stars;
      localStorage.setItem('interstock_level_stars', JSON.stringify(prev));
    }
  } catch { /* ignore */ }
}

function TimerBar({ pct }: { pct: number }) {
  const color = pct > 60 ? 'var(--gr)' : pct > 30 ? 'var(--yellow)' : 'var(--red)';
  return (
    <div style={{ height: 5, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
      <div style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: color, transition: 'width 0.15s linear, background 0.5s' }} />
    </div>
  );
}

type LevelEntry = (typeof LEVEL_GAME)[0];

function LevelNodeCircle({ level, currentLevel, starsMap, dispatch }: {
  level: LevelEntry;
  currentLevel: number;
  starsMap: Record<number, number>;
  dispatch: (a: { type: string; levelId?: number }) => void;
}) {
  const savedStars = starsMap[level.id] ?? 0;
  const isDone     = savedStars > 0 || level.id < currentLevel;
  const isCurrent  = level.id === currentLevel && !isDone;
  const isLocked   = level.id > currentLevel && !isDone;

  let bg     = 'var(--surface2)';
  let border = '3px solid var(--border)';
  let color  = 'var(--text3)';

  if (isDone) {
    bg = 'rgba(0,212,168,0.15)'; border = '3px solid var(--gr)'; color = 'var(--gr)';
  } else if (isCurrent && level.type === 'boss') {
    bg = 'rgba(255,77,109,0.15)'; border = '3px solid var(--red)'; color = 'var(--red)';
  } else if (isCurrent) {
    bg = 'rgba(0,212,168,0.12)'; border = '3px solid var(--gr)'; color = 'var(--gr)';
  } else if (level.type === 'boss') {
    bg = 'rgba(255,77,109,0.1)'; border = '3px solid var(--red)'; color = 'var(--red)';
  }

  const label = isLocked ? '🔒' : isDone ? '✓' : level.type === 'boss' ? '👑' : level.type === 'bonus' ? '⭐' : String(level.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div
        onClick={() => !isLocked && dispatch({ type: 'START_LEVEL_GAME', levelId: level.id })}
        title={isLocked ? `Locked — complete Level ${level.id - 1} first` : level.name}
        style={{
          width: 52, height: 52, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: isLocked ? 'not-allowed' : 'pointer',
          fontFamily: 'monospace', fontSize: 13, fontWeight: 700,
          transition: 'all 0.2s', position: 'relative',
          background: bg, border, color,
        }}
      >
        {label}
        {savedStars > 0 && (
          <div style={{
            position: 'absolute', bottom: -16, left: '50%', transform: 'translateX(-50%)',
            whiteSpace: 'nowrap', color: 'var(--yellow)', fontSize: 9,
          }}>
            {'★'.repeat(savedStars)}{'☆'.repeat(3 - savedStars)}
          </div>
        )}
      </div>
      <div style={{
        fontSize: 9,
        color: isCurrent ? 'var(--gr)' : isDone ? 'var(--gr2)' : 'var(--text3)',
        textAlign: 'center', fontFamily: 'monospace', maxWidth: 70,
        marginTop: savedStars > 0 ? 14 : 0,
      }}>
        {level.name.substring(0, 14)}
      </div>
    </div>
  );
}

// ── Map ──────────────────────────────────────────────────────────────

function MapView() {
  const { state, dispatch } = useApp();
  const { unlockedLevel } = state.levelGame;
  const [starsMap, setStarsMap] = useState(getSavedStars);

  useEffect(() => {
    setStarsMap(getSavedStars());
  }, [state.levelGame.view]);

  const currentLevel   = unlockedLevel;
  const totalCompleted = LEVEL_GAME.filter(lv => (starsMap[lv.id] ?? 0) > 0 || lv.id < currentLevel).length;
  const totalStars     = Object.values(starsMap).reduce((a: number, b) => a + (b as number), 0);

  return (
    <>
      {/* Tip banner */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '10px 14px', background: 'rgba(0,212,168,0.06)',
        border: '1px solid rgba(0,212,168,0.2)', borderRadius: 8, marginBottom: 12,
        fontSize: 13, color: 'var(--text2)', lineHeight: 1.5,
      }}>
        <span style={{ fontSize: 18 }}>🕹</span>
        <div>
          <strong style={{ color: 'var(--text)' }}>Level Up Game</strong> — Progress through 10 increasingly
          challenging levels. Earn stars, unlock boss levels, and collect XP. Just like Candy Crush —
          but it makes you rich instead of addicted!
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        {/* ── Left column ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Level map grid */}
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div className="section-title" style={{ margin: 0 }}>LEVEL MAP — SPRING 2025</div>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'var(--gr-dim)', color: 'var(--gr)', fontWeight: 600 }}>
                {totalCompleted}/10 Cleared
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, padding: '10px 0 6px' }}>
              {LEVEL_GAME.map(lv => (
                <LevelNodeCircle key={lv.id} level={lv} currentLevel={currentLevel} starsMap={starsMap} dispatch={dispatch as (a: { type: string; levelId?: number }) => void} />
              ))}
            </div>
          </div>

          {/* Quick-start cards for first 4 levels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 9 }}>
            {LEVEL_GAME.slice(0, 4).map(lv => {
              const savedStars = starsMap[lv.id] ?? 0;
              const isDone     = savedStars > 0 || lv.id < currentLevel;
              const isLocked   = lv.id > currentLevel && !isDone;
              const isCurrent  = lv.id === currentLevel && !isDone;
              const diffColor  = DIFFICULTY_COLOR[lv.difficulty] ?? 'var(--gr)';
              return (
                <div key={lv.id} className="card" style={{
                  padding: 12,
                  borderColor: isDone ? 'rgba(0,212,168,0.25)' : isCurrent ? 'rgba(0,212,168,0.3)' : undefined,
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{lv.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{lv.name}</div>
                  <div style={{ fontSize: 9, color: 'var(--text3)', marginBottom: 8, lineHeight: 1.4 }}>{lv.description}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: `${diffColor}22`, color: diffColor, fontWeight: 600 }}>
                      {lv.difficulty.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 9, color: 'var(--text3)' }}>+{lv.xpReward} XP</span>
                  </div>
                  {isDone ? (
                    <div style={{ color: 'var(--yellow)', fontSize: 12 }}>
                      {'★'.repeat(savedStars > 0 ? savedStars : 2)}{'☆'.repeat(3 - (savedStars > 0 ? savedStars : 2))}
                    </div>
                  ) : isLocked ? (
                    <button className="btn btn-secondary" style={{ width: '100%', fontSize: 11, padding: '4px 0' }} disabled>🔒</button>
                  ) : (
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', fontSize: 11, padding: '5px 0' }}
                      onClick={() => dispatch({ type: 'START_LEVEL_GAME', levelId: lv.id })}
                    >
                      PLAY →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div style={{ width: 258, flexShrink: 0 }}>

          {/* Progress panel */}
          <div className="card" style={{ marginBottom: 12 }}>
            <div className="section-title" style={{ marginBottom: 12 }}>Your Progress</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <div className="stat-card">
                <div className="stat-label">Levels Done</div>
                <div className="stat-value" style={{ color: 'var(--gr)', fontSize: 17 }}>{totalCompleted}/10</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Stars</div>
                <div className="stat-value" style={{ color: 'var(--yellow)', fontSize: 17 }}>{totalStars}/30</div>
              </div>
            </div>
            {LEVEL_GAME.map(lv => {
              const savedStars = starsMap[lv.id] ?? 0;
              const isDone     = savedStars > 0 || lv.id < currentLevel;
              const isCurrent  = lv.id === currentLevel && !isDone;
              return (
                <div key={lv.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '5px 0', borderBottom: '1px solid rgba(30,52,72,0.4)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{lv.icon}</span>
                    <span style={{ fontSize: 11 }}>{lv.name.substring(0, 18)}</span>
                  </div>
                  <span style={{ fontSize: 11, color: isDone ? 'var(--gr)' : isCurrent ? 'var(--gr)' : 'var(--text3)' }}>
                    {isDone
                      ? (savedStars > 0 ? '★'.repeat(savedStars) + '☆'.repeat(3 - savedStars) : '★★☆')
                      : isCurrent ? 'CURRENT' : '🔒'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Rewards panel */}
          <div className="card">
            <div className="section-title" style={{ marginBottom: 12 }}>Level Rewards</div>
            {LEVEL_GAME.map((lv, i) => (
              <div key={lv.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '5px 0',
                borderBottom: i < LEVEL_GAME.length - 1 ? '1px solid rgba(30,52,72,0.4)' : 'none',
              }}>
                <span style={{ fontSize: 11, color: 'var(--text2)' }}>
                  {lv.icon}
                  {lv.type === 'boss'     ? ' 👑 BOSS'  : ''}
                  {lv.type === 'bonus'    ? ' ⭐ BONUS' : ''}
                  {lv.type === 'advanced' ? ' 🧮'       : ''}
                  {' '}L{lv.id}
                </span>
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--gr)' }}>+{lv.xpReward} XP</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Play ─────────────────────────────────────────────────────────────

function PlayView() {
  const { state, dispatch } = useApp();
  const { levelGame } = state;
  const { currentLevel, questionIdx, lives, timeLeft, score } = levelGame;

  const levelData      = LEVEL_GAME[currentLevel - 1];
  const question       = levelData?.questions[questionIdx];
  const totalQuestions = levelData?.questions.length ?? 3;

  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answeredRef = useRef(false);

  useEffect(() => {
    setSelected(null);
    setRevealed(false);
    answeredRef.current = false;
  }, [questionIdx]);

  useEffect(() => {
    if (!levelGame.active || revealed) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    answeredRef.current = false;
    intervalRef.current = setInterval(() => {
      dispatch({ type: 'TICK_LEVEL', elapsed: 1 });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [levelGame.active, revealed, questionIdx, dispatch]);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    if (questionIdx >= totalQuestions && levelGame.active) {
      const passed = score >= Math.ceil(totalQuestions * 0.67);
      dispatch({ type: 'END_LEVEL_GAME', passed });
    }
  }, [questionIdx, totalQuestions, levelGame.active, score, dispatch]);

  if (!question || questionIdx >= totalQuestions) return null;

  const pct       = (timeLeft / 30) * 100;
  const xpGained  = score * 10;
  const isLastQ   = questionIdx === totalQuestions - 1;
  const diffColor = DIFFICULTY_COLOR[levelData.difficulty] ?? 'var(--gr)';

  function handleAnswer(idx: number) {
    if (revealed || answeredRef.current) return;
    answeredRef.current = true;
    setSelected(idx);
    setRevealed(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  function handleNext() {
    if (!revealed) return;
    const correct = selected === question!.answer;
    dispatch({ type: 'ANSWER_LEVEL', answerIdx: selected ?? -1, correct });
  }

  function handleQuit() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    dispatch({ type: 'END_LEVEL_GAME', passed: false });
  }

  return (
    <div className="page-body" style={{ maxWidth: 700, margin: '0 auto' }}>

      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={handleQuit}>← Map</button>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
            {levelData.icon} {levelData.name}
          </span>
          <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${diffColor}22`, color: diffColor, fontWeight: 600 }}>
            {levelData.difficulty.toUpperCase()}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text3)' }}>
            Q {questionIdx + 1}/{totalQuestions}
          </span>
          <div style={{ display: 'flex', gap: 2 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} style={{ fontSize: 14, opacity: i < lives ? 1 : 0.2 }}>❤️</span>
            ))}
          </div>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--gr)', fontWeight: 600 }}>
            +{xpGained} XP
          </span>
        </div>
      </div>

      {/* Timer bar */}
      <TimerBar pct={pct} />

      {/* Question card */}
      <div style={{
        border: '2px solid var(--border2)', borderRadius: 10,
        padding: 20, marginBottom: 14, background: 'var(--surface)',
      }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', lineHeight: 1.7, marginBottom: 20 }}>
          {question.text}
        </div>

        {question.options.map((opt, i) => {
          const isCorrect  = i === question.answer;
          const isSelected = i === selected;
          let border = 'var(--border)';
          let bg     = 'var(--surface)';
          let opacity = 1;

          if (revealed) {
            if (isCorrect)       { border = 'var(--gr)';  bg = 'rgba(0,212,168,0.12)'; }
            else if (isSelected) { border = 'var(--red)'; bg = 'rgba(255,77,109,0.12)'; }
            else                 { opacity = 0.35; }
          }

          return (
            <div
              key={i}
              onClick={() => !revealed && handleAnswer(i)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '11px 14px',
                background: bg, border: `1px solid ${border}`,
                borderRadius: 6, cursor: revealed ? 'not-allowed' : 'pointer',
                marginBottom: 8, fontSize: 13, lineHeight: 1.45,
                opacity, transition: 'all 0.15s', userSelect: 'none',
              }}
            >
              <div style={{
                minWidth: 22, height: 22, borderRadius: 4,
                background: 'var(--bg3)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'monospace', fontSize: 10, fontWeight: 700,
                flexShrink: 0, marginTop: 1, color: 'var(--text2)',
              }}>
                {OPTION_KEYS[i]}
              </div>
              <div style={{ flex: 1 }}>
                {opt}
                {revealed && (isCorrect || isSelected) && (
                  <div style={{ fontSize: 11, marginTop: 5, color: isCorrect ? 'var(--gr)' : 'var(--red)' }}>
                    {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </div>
                )}
              </div>
              {revealed && isCorrect && (
                <span style={{ color: 'var(--gr)', fontSize: 11, fontFamily: 'monospace', flexShrink: 0 }}>+10 XP</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Next / Results button */}
      {revealed && (
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button className="btn btn-primary" onClick={handleNext} style={{ padding: '10px 28px' }}>
            {isLastQ ? 'See Results →' : 'Next Question →'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Result ───────────────────────────────────────────────────────────

function ResultView() {
  const { state, dispatch } = useApp();
  const { levelGame } = state;
  const { score, currentLevel } = levelGame;
  const levelData      = LEVEL_GAME[currentLevel - 1];
  const totalQuestions = levelData?.questions.length ?? 3;
  const pct            = Math.round((score / totalQuestions) * 100);
  const stars          = calcStars(pct);
  const passed         = pct >= PASS_THRESHOLD;
  const xpEarned       = passed ? levelData.xpReward : 0;
  const hasNext        = currentLevel < LEVEL_GAME.length;

  useEffect(() => {
    if (passed && xpEarned > 0) {
      dispatch({ type: 'ADD_XP', amount: xpEarned });
      saveStars(currentLevel, stars);
    }
  }, []);

  function resultColor(): string {
    if (pct >= 80) return 'var(--gr)';
    if (pct >= 50) return 'var(--gr)';
    return 'var(--yellow)';
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: '32px 0' }}>

      {/* Level name */}
      <div style={{ fontSize: 18, marginBottom: 6, color: 'var(--text3)', fontFamily: 'monospace' }}>
        {levelData?.icon} {levelData?.name}
      </div>

      {/* Star rating */}
      <div style={{ fontSize: 48, margin: '14px 0', color: 'var(--yellow)' }}>
        {'★'.repeat(stars)}{'☆'.repeat(3 - stars)}
      </div>

      {/* Score % */}
      <div style={{ fontFamily: 'monospace', fontSize: 32, fontWeight: 700, color: resultColor(), marginBottom: 8 }}>
        {pct}%
      </div>

      {/* Sub-line */}
      <div style={{ color: 'var(--text3)', marginBottom: 20, fontFamily: 'monospace', fontSize: 13 }}>
        {score}/{totalQuestions} correct · +{xpEarned} XP earned
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Score</div>
          <div className="stat-value">{score}/{totalQuestions}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">XP Gained</div>
          <div className="stat-value" style={{ color: 'var(--gr)' }}>+{xpEarned}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Stars</div>
          <div className="stat-value" style={{ color: 'var(--yellow)' }}>{stars > 0 ? '★'.repeat(stars) : '—'}</div>
        </div>
      </div>

      {/* Pass/fail message */}
      {passed ? (
        <div style={{
          background: 'var(--gr-dim)', border: '1px solid rgba(0,212,168,0.3)',
          borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 13, color: 'var(--text)',
        }}>
          🎉 Level Cleared!{' '}
          {stars === 3
            ? 'Perfect score — you mastered this level!'
            : stars === 2
            ? 'Well done! Try again for 3 stars.'
            : 'You passed! Keep practicing.'}
        </div>
      ) : (
        <div style={{
          background: 'var(--red-dim)', border: '1px solid rgba(255,77,109,0.25)',
          borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 13, color: 'var(--text)',
        }}>
          Keep practicing! You need {PASS_THRESHOLD}%+ to pass. Review the lesson material and try again.
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button
          className="btn btn-primary"
          onClick={() => dispatch({ type: 'START_LEVEL_GAME', levelId: currentLevel })}
          style={{ padding: '11px 20px' }}
        >
          🔄 Retry Level
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => {
            if (passed && hasNext) dispatch({ type: 'START_LEVEL_GAME', levelId: currentLevel + 1 });
            else dispatch({ type: 'SET_LEVEL_VIEW', view: 'map' });
          }}
          style={{ padding: '11px 20px' }}
        >
          {passed && hasNext ? 'Next Level →' : 'Back to Map'}
        </button>
      </div>
    </div>
  );
}

// ── Router ───────────────────────────────────────────────────────────

export default function LevelGame() {
  const { state } = useApp();
  const { view } = state.levelGame;

  if (view === 'play')   return <PlayView />;
  if (view === 'result') return <ResultView />;
  return <MapView />;
}
