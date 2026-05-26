import { useEffect, useRef, useState } from 'react';
import { useApp } from '../state/AppContext';
import { ALL_SCENARIOS } from '../data/scenarios';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function GamePlay() {
  const { state, dispatch } = useApp();
  const { game } = state;
  const scenario = ALL_SCENARIOS[game.scenarioIdx];

  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const advanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [game.active, revealed, game.scenarioIdx, dispatch]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (advanceRef.current) clearTimeout(advanceRef.current);
    };
  }, []);

  function handleAnswer(idx: number) {
    if (revealed) return;
    const correct = idx === scenario.answer;
    setSelected(idx);
    setRevealed(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    advanceRef.current = setTimeout(() => {
      dispatch({ type: 'ANSWER_GAME', answerIdx: idx, correct });
    }, 1800);
  }

  const { timeLeft, totalTime, scenarioIdx } = game;
  const pct = (timeLeft / totalTime) * 100;

  let timerClass = 'game-timer';
  let fillColor = 'linear-gradient(90deg, var(--gr2), var(--gr))';
  if (timeLeft < 30) {
    timerClass += ' danger';
    fillColor = 'var(--red)';
  } else if (timeLeft < 60) {
    timerClass += ' warning';
    fillColor = 'var(--yellow)';
  }

  return (
    <div
      className="page-body"
      style={{
        maxWidth: 680,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 0',
        }}
      >
        <span style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 600 }}>
          Q {scenarioIdx + 1} of 15
        </span>
        <span
          className="badge badge-blue"
          style={{ fontSize: 11 }}
        >
          {scenario.category}
        </span>
        <span style={{ fontSize: 13, color: 'var(--text3)' }}>
          Score: {game.score}
        </span>
      </div>

      <div className="game-card" style={{ padding: '20px 24px' }}>
        <div className={timerClass}>{timeLeft}s</div>
        <div className="game-progress-bar">
          <div
            className="game-progress-fill"
            style={{
              width: `${pct}%`,
              background: fillColor,
            }}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <p
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: 'var(--text)',
            lineHeight: 1.7,
            marginBottom: 20,
          }}
        >
          {scenario.text}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {scenario.options.map((opt, idx) => {
            let optClass = 'game-option';
            if (revealed) {
              if (idx === scenario.answer) optClass += ' correct';
              else if (idx === selected) optClass += ' wrong';
            }
            return (
              <button
                key={idx}
                className={optClass}
                onClick={() => handleAnswer(idx)}
                disabled={revealed}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: 'var(--border)',
                    fontSize: 11,
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {OPTION_LABELS[idx]}
                </span>
                <span style={{ flex: 1 }}>{opt}</span>
              </button>
            );
          })}
        </div>

        {revealed && (
          <div
            style={{
              marginTop: 16,
              padding: '12px 16px',
              background: 'var(--bg3)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontSize: 13,
              color: 'var(--text2)',
              lineHeight: 1.6,
            }}
          >
            <span style={{ color: 'var(--gr)', fontWeight: 600 }}>Explanation: </span>
            {scenario.explanation}
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          justifyContent: 'center',
          flexWrap: 'wrap',
          padding: '4px 0',
        }}
      >
        {ALL_SCENARIOS.map((_, i) => {
          let bg = 'var(--surface2)';
          if (i < game.answers.length) {
            const ans = game.answers[i];
            bg = ans === ALL_SCENARIOS[i].answer ? 'var(--gr)' : 'var(--red)';
          } else if (i === scenarioIdx) {
            bg = 'var(--blue)';
          }
          return (
            <div
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: bg,
                opacity: i === scenarioIdx ? 1 : 0.7,
              }}
            />
          );
        })}
      </div>

      <div style={{ textAlign: 'center', paddingBottom: 8 }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => dispatch({ type: 'END_GAME' })}
          style={{ fontSize: 12 }}
        >
          End Game
        </button>
      </div>
    </div>
  );
}
