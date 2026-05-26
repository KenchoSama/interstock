import { useState } from 'react';
import { useApp } from '../state/AppContext';
import { DIPLOMA_COURSES } from '../data/courses';
import type { DiplomaExam } from '../types';

export default function Diplomas() {
  const { state, dispatch } = useApp();
  const userXp = state.u[state.role].xp;
  const earnedMap = state.u[state.role].diplomas;
  const [activeExam, setActiveExam] = useState<DiplomaExam | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [examDone, setExamDone] = useState(false);
  const [score, setScore] = useState(0);

  function startExam(course: DiplomaExam) {
    setActiveExam(course);
    setCurrentQ(0);
    setAnswers(new Array(course.questions.length).fill(null));
    setExamDone(false);
    setScore(0);
  }

  function answerQ(optIdx: number) {
    if (!activeExam) return;
    const newAnswers = [...answers];
    newAnswers[currentQ] = optIdx;
    setAnswers(newAnswers);
    if (currentQ < activeExam.questions.length - 1) {
      setCurrentQ(q => q + 1);
    } else {
      const correct = newAnswers.filter((a, i) => a === activeExam.questions[i].answer).length;
      const pct = Math.round((correct / activeExam.questions.length) * 100);
      setScore(pct);
      setExamDone(true);
      if (pct >= activeExam.passingScore) {
        dispatch({ type: 'EARN_DIPLOMA', courseId: activeExam.id, score: pct });
        dispatch({ type: 'ADD_XP', amount: 300 });
      }
    }
  }

  if (activeExam && !examDone) {
    const q = activeExam.questions[currentQ];
    return (
      <div>
        <div className="page-header">
          <div>
            <div className="page-title">{activeExam.course} — Exam</div>
            <div className="page-subtitle">Question {currentQ + 1} of {activeExam.questions.length}</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveExam(null)}>
            Exit Exam
          </button>
        </div>
        <div className="page-body">
          <div className="card" style={{ maxWidth: 640, margin: '0 auto' }}>
            <div style={{ marginBottom: 16 }}>
              <div className="progress-bar" style={{ marginBottom: 16 }}>
                <div className="progress-fill" style={{ width: `${((currentQ) / activeExam.questions.length) * 100}%` }} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, lineHeight: 1.5 }}>{q.q}</div>
              {q.options.map((opt, i) => (
                <button key={i} className="game-option" onClick={() => answerQ(i)}>
                  <strong style={{ color: 'var(--text3)', marginRight: 8 }}>{String.fromCharCode(65 + i)}.</strong> {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeExam && examDone) {
    const passed = score >= activeExam.passingScore;
    return (
      <div>
        <div className="page-header">
          <div className="page-title">{activeExam.course} — Results</div>
        </div>
        <div className="page-body">
          <div className="card" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>{passed ? '🎓' : '📚'}</div>
            <div style={{ fontSize: 48, fontWeight: 800, color: passed ? 'var(--gr)' : 'var(--red)', marginBottom: 8 }}>{score}%</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              {passed ? 'Diploma Earned! 🎉' : 'Not Quite — Try Again'}
            </div>
            <div style={{ color: 'var(--text2)', marginBottom: 24 }}>
              {passed
                ? `Congratulations! You passed with ${score}%. Your diploma has been added to your profile.`
                : `You need ${activeExam.passingScore}% to pass. Keep studying and try again!`}
            </div>
            {passed && <div className="xp-tag" style={{ marginBottom: 20 }}>+300 XP earned</div>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setActiveExam(null)}>← Back to Diplomas</button>
              {!passed && <button className="btn btn-primary" onClick={() => startExam(activeExam)}>Retake Exam</button>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Diploma Programs 🎓</div>
          <div className="page-subtitle">Earn official certificates to showcase your knowledge</div>
        </div>
      </div>
      <div className="page-body">
        <div className="grid-2">
          {DIPLOMA_COURSES.map(course => {
            const earned = earnedMap.find(d => d.courseId === course.id);
            const locked = userXp < course.xpRequired;
            return (
              <div
                key={course.id}
                className="diploma-card"
                style={{ opacity: locked ? 0.5 : 1 }}
              >
                <div className="diploma-icon">{earned?.earned ? '🏆' : locked ? '🔒' : '📜'}</div>
                <div className="diploma-title">{course.course}</div>
                <div className="diploma-desc">
                  {course.questions.length}-question exam · Passing score: {course.passingScore}%
                </div>
                {earned?.earned ? (
                  <div>
                    <span className="badge badge-green">✓ Earned {earned.score}%</span>
                    {earned.date && <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 8 }}>{earned.date}</span>}
                    <button className="btn btn-secondary btn-sm" style={{ display: 'block', marginTop: 12 }}>
                      📄 Download PDF
                    </button>
                  </div>
                ) : locked ? (
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                    Requires {course.xpRequired.toLocaleString()} XP (you have {userXp.toLocaleString()})
                  </div>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={() => startExam(course)}>
                    Take Exam
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
