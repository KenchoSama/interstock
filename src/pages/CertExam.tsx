import { useState } from 'react';
import { useApp } from '../state/AppContext';
import { CERT_Q } from '../data/training';

export default function CertExam() {
  const { state, dispatch } = useApp();
  const { certView, certScore, certPassed } = state.training;
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(CERT_Q.length).fill(null));

  if (certView === 'result') {
    return (
      <div>
        <div className="page-header"><div className="page-title">Certification Result 🎓</div></div>
        <div className="page-body">
          <div className="card" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>{certPassed ? '🎓' : '📚'}</div>
            <div style={{ fontSize: 48, fontWeight: 800, color: certPassed ? 'var(--gr)' : 'var(--red)', marginBottom: 8 }}>
              {certScore}%
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              {certPassed ? 'Certification Earned!' : 'Not Passed — Review & Retry'}
            </div>
            <div style={{ color: 'var(--text2)', marginBottom: 24 }}>
              {certPassed
                ? 'Congratulations! You are now a certified InterStock educator.'
                : 'You need 70% to pass. Complete more training modules and try again.'}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button
                className="btn btn-secondary"
                onClick={() => dispatch({ type: 'SET_VIEW', view: 'staff-training' })}
              >
                ← Back to Training
              </button>
              {!certPassed && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setCurrentQ(0);
                    setAnswers(new Array(CERT_Q.length).fill(null));
                    dispatch({ type: 'SET_CERT_VIEW', view: 'exam' });
                  }}
                >
                  Retake Exam
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (certView === 'exam') {
    const q = CERT_Q[currentQ];
    const selected = answers[currentQ];

    function selectAnswer(i: number) {
      const next = [...answers];
      next[currentQ] = i;
      setAnswers(next);
    }

    function advance() {
      if (currentQ < CERT_Q.length - 1) {
        setCurrentQ(q => q + 1);
      } else {
        const correct = answers.filter((a, i) => a === CERT_Q[i].answer).length;
        const score = Math.round((correct / CERT_Q.length) * 100);
        const passed = score >= 70;
        dispatch({ type: 'SET_CERT_RESULT', score, passed });
      }
    }

    return (
      <div>
        <div className="page-header">
          <div>
            <div className="page-title">Certification Exam</div>
            <div className="page-subtitle">Question {currentQ + 1} of {CERT_Q.length}</div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setCurrentQ(0);
              setAnswers(new Array(CERT_Q.length).fill(null));
              dispatch({ type: 'SET_CERT_VIEW', view: 'list' });
            }}
          >
            Exit Exam
          </button>
        </div>
        <div className="page-body">
          <div className="card" style={{ maxWidth: 640, margin: '0 auto' }}>
            <div className="progress-bar" style={{ marginBottom: 20 }}>
              <div className="progress-fill" style={{ width: `${(currentQ / CERT_Q.length) * 100}%` }} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, lineHeight: 1.5 }}>{q.q}</div>
            {q.options.map((opt, i) => (
              <button
                key={i}
                className={`game-option ${selected === i ? 'correct' : ''}`}
                onClick={() => selectAnswer(i)}
              >
                <strong style={{ color: 'var(--text3)', marginRight: 8 }}>{String.fromCharCode(65 + i)}.</strong> {opt}
              </button>
            ))}
            {selected !== null && (
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 12 }}
                onClick={advance}
              >
                {currentQ < CERT_Q.length - 1 ? 'Next Question →' : 'Submit Exam'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div className="page-header">
        <div>
          <div className="page-title">Certification Exam 🎓</div>
          <div className="page-subtitle">Prove your knowledge to become a certified InterStock educator</div>
        </div>
      </div>
      <div className="page-body">
        <div className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>InterStock Staff Certification</div>
            <div style={{ color: 'var(--text2)', lineHeight: 1.6 }}>
              {CERT_Q.length} questions covering the platform, curriculum, compliance, and teaching best practices.
              You need 70% or higher to pass. Recommended: complete all 9 training modules first.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 24 }}>
            {[{ label: 'Questions', value: String(CERT_Q.length) }, { label: 'Passing Score', value: '70%' }, { label: 'Time Limit', value: 'None' }].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--gr)' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{s.label}</div>
              </div>
            ))}
          </div>
          {state.u[state.role].certPassed && (
            <div className="badge badge-green" style={{ display: 'block', textAlign: 'center', padding: 8, marginBottom: 16 }}>
              ✓ You are already certified!
            </div>
          )}
          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={() => {
              setCurrentQ(0);
              setAnswers(new Array(CERT_Q.length).fill(null));
              dispatch({ type: 'SET_CERT_VIEW', view: 'exam' });
            }}
          >
            {state.u[state.role].certPassed ? 'Retake Exam' : 'Start Certification Exam'}
          </button>
        </div>
      </div>
    </div>
  );
}
