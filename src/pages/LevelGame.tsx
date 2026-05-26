import { useEffect, useRef } from 'react';
import { useApp } from '../state/AppContext';
import { LEVEL_GAME } from '../data/levels';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

function MapView() {
  const { state, dispatch } = useApp();
  const { unlockedLevel } = state.levelGame;

  return (
    <div className="page-body" style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
          Level Up Game
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text2)' }}>
          Complete levels to unlock advanced topics and earn XP.
        </p>
      </div>

      <div className="level-map">
        {LEVEL_GAME.map(level => {
          const completed = level.id < unlockedLevel;
          const locked = level.id > unlockedLevel;
          const available = level.id === unlockedLevel;

          let nodeClass = 'level-node';
          if (completed) nodeClass += ' completed';
          if (locked) nodeClass += ' locked';

          return (
            <button
              key={level.id}
              className={nodeClass}
              style={{
                width: '100%',
                textAlign: 'left',
                border: available
                  ? '1px solid var(--gr)'
                  : undefined,
                boxShadow: available ? '0 0 0 2px var(--gr-glow)' : undefined,
              }}
              disabled={locked}
              onClick={() => {
                if (!locked) dispatch({ type: 'START_LEVEL_GAME', levelId: level.id });
              }}
            >
              <div className="level-node-num">
                {completed ? '✓' : locked ? '🔒' : level.id}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: completed ? 'var(--gr)' : locked ? 'var(--text3)' : 'var(--text)',
                    marginBottom: 2,
                  }}
                >
                  Level {level.id}: {level.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                  {level.description}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <span className="xp-tag" style={{ fontSize: 11 }}>
                  +{level.xpReward} XP
                </span>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                  {level.questions.length} Qs
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PlayView() {
  const { state, dispatch } = useApp();
  const { levelGame } = state;
  const { currentLevel, questionIdx, lives, timeLeft, score } = levelGame;

  const levelData = LEVEL_GAME[currentLevel - 1];
  const question = levelData?.questions[questionIdx];
  const totalQuestions = levelData?.questions.length ?? 3;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answeredRef = useRef(false);

  useEffect(() => {
    answeredRef.current = false;
  }, [questionIdx]);

  useEffect(() => {
    if (!levelGame.active) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    answeredRef.current = false;
    intervalRef.current = setInterval(() => {
      dispatch({ type: 'TICK_LEVEL', elapsed: 1 });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [levelGame.active, questionIdx, dispatch]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!levelGame.active && levelGame.view === 'play') {
      return;
    }
    if (questionIdx >= totalQuestions && levelGame.active) {
      const passed = score >= Math.ceil(totalQuestions * 0.67);
      dispatch({ type: 'END_LEVEL_GAME', passed });
    }
  }, [questionIdx, totalQuestions, levelGame.active, score, dispatch]);

  if (!question) return null;

  const pct = (timeLeft / 30) * 100;
  let timerClass = 'game-timer';
  if (timeLeft < 10) timerClass += ' danger';
  else if (timeLeft < 20) timerClass += ' warning';

  function handleAnswer(idx: number) {
    if (answeredRef.current) return;
    answeredRef.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);
    const correct = idx === question.answer;
    dispatch({ type: 'ANSWER_LEVEL', answerIdx: idx, correct });
  }

  return (
    <div className="page-body" style={{ maxWidth: 680, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>
            Level {currentLevel}: {levelData.name}
          </span>
          <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 600 }}>
            Q {questionIdx + 1} of {totalQuestions}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} style={{ fontSize: 18, opacity: i < lives ? 1 : 0.2 }}>
              ❤️
            </span>
          ))}
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>Score</span>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gr)' }}>{score}</div>
        </div>
      </div>

      <div className="game-card" style={{ padding: '16px 24px', marginBottom: 16 }}>
        <div className={timerClass}>{timeLeft}s</div>
        <div className="game-progress-bar">
          <div
            className="game-progress-fill"
            style={{
              width: `${pct}%`,
              background:
                timeLeft < 10
                  ? 'var(--red)'
                  : timeLeft < 20
                  ? 'var(--yellow)'
                  : 'linear-gradient(90deg, var(--gr2), var(--gr))',
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
          {question.text}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {question.options.map((opt, idx) => (
            <button
              key={idx}
              className="game-option"
              onClick={() => handleAnswer(idx)}
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
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            dispatch({ type: 'END_LEVEL_GAME', passed: false });
          }}
          style={{ fontSize: 12 }}
        >
          Quit Level
        </button>
      </div>
    </div>
  );
}

function ResultView() {
  const { state, dispatch } = useApp();
  const { levelGame } = state;
  const { passed, score, currentLevel } = levelGame;
  const levelData = LEVEL_GAME[currentLevel - 1];
  const totalQuestions = levelData?.questions.length ?? 3;
  const xpEarned = passed ? levelData.xpReward : 0;

  useEffect(() => {
    if (passed && xpEarned > 0) {
      dispatch({ type: 'ADD_XP', amount: xpEarned });
    }
  }, []);

  return (
    <div className="page-body" style={{ maxWidth: 560, margin: '0 auto' }}>
      <div
        className="game-card"
        style={{ padding: '40px 28px', marginBottom: 20 }}
      >
        <div style={{ fontSize: 56, marginBottom: 12 }}>
          {passed ? '🏆' : '💪'}
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: passed ? 'var(--gr)' : 'var(--red)',
            marginBottom: 6,
          }}
        >
          {passed ? 'Level Passed!' : 'Level Failed'}
        </div>
        <div style={{ fontSize: 15, color: 'var(--text2)', marginBottom: 8 }}>
          Level {currentLevel}: {levelData?.name}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>
          {score} / {totalQuestions} correct
        </div>
        {passed ? (
          <div className="xp-tag" style={{ fontSize: 14, padding: '4px 14px' }}>
            +{xpEarned} XP earned
          </div>
        ) : (
          <div
            style={{
              fontSize: 13,
              color: 'var(--text2)',
              maxWidth: 320,
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            You need at least {Math.ceil(totalQuestions * 0.67)} correct answers to pass.
            Keep practicing and try again!
          </div>
        )}
      </div>

      {passed && (
        <div
          className="card"
          style={{
            marginBottom: 20,
            background: 'var(--gr-dim)',
            border: '1px solid var(--gr2)',
            textAlign: 'center',
            padding: 20,
          }}
        >
          <div style={{ fontSize: 22, marginBottom: 6 }}>
            {currentLevel < LEVEL_GAME.length ? '🔓 Next Level Unlocked!' : '🎓 All Levels Complete!'}
          </div>
          {currentLevel < LEVEL_GAME.length && (
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>
              Level {currentLevel + 1}: {LEVEL_GAME[currentLevel]?.name} is now available.
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {!passed && (
          <button
            className="btn btn-primary"
            onClick={() =>
              dispatch({ type: 'START_LEVEL_GAME', levelId: currentLevel })
            }
          >
            Try Again
          </button>
        )}
        <button
          className="btn btn-secondary"
          onClick={() => dispatch({ type: 'SET_LEVEL_VIEW', view: 'map' })}
        >
          Back to Map
        </button>
      </div>
    </div>
  );
}

export default function LevelGame() {
  const { state } = useApp();
  const { view } = state.levelGame;

  if (view === 'play') return <PlayView />;
  if (view === 'result') return <ResultView />;
  return <MapView />;
}
