import { useEffect, useRef, useState } from 'react';
import { useApp } from '../state/AppContext';
import { ALL_SCENARIOS } from '../data/scenarios';

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

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

function timerColor(pct: number): string {
  if (pct > 60) return 'var(--gr)';
  if (pct > 30) return 'var(--yellow)';
  return 'var(--red)';
}

function TimerBar({ pct }: { pct: number }) {
  return (
    <div style={{ height: 5, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
      <div style={{
        height: '100%', borderRadius: 3,
        width: `${pct}%`,
        background: timerColor(pct),
        transition: 'width 0.15s linear, background 0.5s',
      }} />
    </div>
  );
}

export default function GamePlay() {
  const { state, dispatch } = useApp();
  const { game } = state;
  const scenario = ALL_SCENARIOS[game.scenarioIdx];

  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSelected(null);
    setRevealed(false);
  }, [game.scenarioIdx]);

  useEffect(() => {
    if (!game.active || revealed) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      dispatch({ type: 'TICK_GAME', elapsed: 1 });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [game.active, revealed, game.scenarioIdx, dispatch]);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  function handleAnswer(idx: number) {
    if (revealed) return;
    const correct = idx === scenario.answer;
    setSelected(idx);
    setRevealed(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimeout(() => {
      dispatch({ type: 'ANSWER_GAME', answerIdx: idx, correct });
    }, 1800);
  }

  function handleNext() {
    dispatch({ type: 'ANSWER_GAME', answerIdx: selected ?? -1, correct: selected === scenario.answer });
  }

  const pct = (game.timeLeft / game.totalTime) * 100;
  const cardColor = CATEGORY_COLOR[scenario.category] ?? 'var(--gr)';
  const isLastQuestion = game.scenarioIdx === ALL_SCENARIOS.length - 1;

  return (
    <div className="page-body" style={{ maxWidth: 700, margin: '0 auto' }}>

      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 11, padding: '3px 8px', borderRadius: 6, fontWeight: 600,
            background: `${cardColor}22`, color: cardColor,
          }}>
            {scenario.category}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'monospace' }}>
            Q {game.scenarioIdx + 1}/{ALL_SCENARIOS.length}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'monospace' }}>
            ⏱ {game.timeLeft}s
          </span>
          <span style={{ fontSize: 12, color: 'var(--gr)', fontFamily: 'monospace', fontWeight: 600 }}>
            Score: {game.score}
          </span>
        </div>
      </div>

      {/* Timer bar */}
      <TimerBar pct={pct} />

      {/* Scenario card */}
      <div style={{
        border: `2px solid ${cardColor}`,
        borderRadius: 10,
        padding: 20,
        marginBottom: 14,
        background: `${cardColor}08`,
      }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', lineHeight: 1.7, marginBottom: 20 }}>
          {scenario.text}
        </div>

        {/* Choices */}
        {scenario.options.map((opt, i) => {
          const isCorrect = i === scenario.answer;
          const isSelected = i === selected;
          let border = 'var(--border)';
          let bg = 'var(--surface)';
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
                opacity, transition: 'all 0.15s',
                userSelect: 'none',
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
                <span style={{ color: 'var(--gr)', fontSize: 11, fontFamily: 'monospace', flexShrink: 0 }}>
                  +10 XP
                </span>
              )}
            </div>
          );
        })}

        {/* Explanation */}
        {revealed && (
          <div style={{
            marginTop: 12, padding: '12px 14px',
            background: 'var(--bg3)', borderRadius: 8,
            fontSize: 13, color: 'var(--text2)', lineHeight: 1.6,
          }}>
            <span style={{ color: 'var(--gr)', fontWeight: 600 }}>Explanation: </span>
            {scenario.explanation}
          </div>
        )}
      </div>

      {/* Next / See Results button */}
      {revealed && (
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button className="btn btn-primary" onClick={handleNext} style={{ padding: '10px 28px' }}>
            {isLastQuestion ? 'See Results →' : 'Next →'}
          </button>
        </div>
      )}

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16 }}>
        {ALL_SCENARIOS.map((s, i) => {
          let bg = 'var(--surface2)';
          if (i < game.answers.length) {
            bg = game.answers[i] === s.answer ? 'var(--gr)' : 'var(--red)';
          } else if (i === game.scenarioIdx) {
            bg = 'var(--blue)';
          }
          return (
            <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: bg, opacity: i === game.scenarioIdx ? 1 : 0.7 }} />
          );
        })}
      </div>

      {/* End game */}
      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => dispatch({ type: 'END_GAME' })} style={{ fontSize: 12 }}>
          End Game
        </button>
      </div>
    </div>
  );
}
