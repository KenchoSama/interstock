import { useState } from 'react';
import { useApp } from '../state/AppContext';
import { DIPLOMA_COURSES } from '../data/courses';

const COURSE_META: Record<string, { icon: string; level: string; topics: string[]; color: string }> = {
  'stock-basics': {
    icon: '💰',
    level: 'Foundation',
    topics: ['Market Basics', 'Orders', 'Dividends', 'Bear Markets', 'SEC'],
    color: 'var(--gr)',
  },
  'technical-analysis': {
    icon: '📊',
    level: 'Intermediate',
    topics: ['Candlesticks', 'MACD', 'Bollinger Bands', 'Fibonacci', 'Oscillators'],
    color: 'var(--blue)',
  },
  'options-trading': {
    icon: '⚡',
    level: 'Advanced',
    topics: ['Option Greeks', 'Covered Calls', 'Protective Puts', 'Iron Condor', 'IV'],
    color: 'var(--yellow)',
  },
  'crypto-defi': {
    icon: '🔐',
    level: 'Intermediate',
    topics: ['Blockchain', 'Smart Contracts', 'DeFi', 'NFTs', 'Gas Fees'],
    color: '#a855f7',
  },
};

type Course = typeof DIPLOMA_COURSES[0];

export default function Diplomas() {
  const { state, dispatch } = useApp();
  const userXp      = state.u[state.role].xp;
  const userDiplomas = state.u[state.role].diplomas;

  const [activeExam, setActiveExam]   = useState<Course | null>(null);
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examResult, setExamResult]   = useState<{ passed: boolean; score: number; pct: number } | null>(null);

  function startExam(course: Course) {
    setActiveExam(course);
    setExamAnswers({});
    setExamResult(null);
  }

  function handleAnswer(qi: number, oi: number) {
    setExamAnswers(prev => ({ ...prev, [qi]: oi }));
  }

  function handleSubmit() {
    if (!activeExam) return;
    const correct = activeExam.questions.filter((q, i) => examAnswers[i] === q.answer).length;
    const pct     = Math.round((correct / activeExam.questions.length) * 100);
    const passed  = pct >= activeExam.passingScore;
    setExamResult({ passed, score: correct, pct });
    if (passed) {
      dispatch({ type: 'EARN_DIPLOMA', courseId: activeExam.id, score: pct });
      dispatch({ type: 'ADD_XP', amount: 300 });
    }
  }

  function closeModal() {
    setActiveExam(null);
    setExamResult(null);
    setExamAnswers({});
  }

  const answeredCount = Object.keys(examAnswers).length;

  function badgeStyle(isEarned: boolean, canTake: boolean) {
    if (isEarned)  return { background: 'rgba(249,199,79,0.15)', color: 'var(--yellow)',  border: '1px solid rgba(249,199,79,0.4)' };
    if (canTake)   return { background: 'var(--gr-dim)',          color: 'var(--gr)',      border: '1px solid var(--gr)' };
    return           { background: 'var(--surface2)',             color: 'var(--text3)',   border: '1px solid var(--border)' };
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

        {/* Tip box */}
        <div style={{
          background: 'var(--gr-dim)', border: '1px solid var(--gr)',
          borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 20,
          fontSize: 13, color: 'var(--text)', lineHeight: 1.6,
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <span style={{ flexShrink: 0 }}>🎓</span>
          <span>
            <strong>InterStock Diplomas</strong> — Intensive exams that test real knowledge.
            Pass with 80%+ to earn a downloadable PDF certificate you can add to your resume,
            LinkedIn, or college application!
          </span>
        </div>

        {/* Course card grid */}
        <div className="grid-2">
          {DIPLOMA_COURSES.map(course => {
            const meta        = COURSE_META[course.id] ?? { icon: '📜', level: 'Foundation', topics: [], color: 'var(--gr)' };
            const earnedRecord = userDiplomas.find(d => d.courseId === course.id);
            const isEarned    = earnedRecord?.earned === true;
            const canTake     = userXp >= course.xpRequired;
            const bs          = badgeStyle(isEarned, canTake);

            return (
              <div key={course.id} className="card" style={{
                padding: 0, overflow: 'hidden',
                borderColor: isEarned ? 'rgba(249,199,79,0.5)' : undefined,
              }}>

                {/* Panel header */}
                <div style={{
                  background: 'var(--surface)', padding: '12px 16px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{meta.icon}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                        {course.course}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>
                        {meta.level} · {course.questions.length} Questions · {course.passingScore}%+ to pass
                      </div>
                    </div>
                  </div>
                  <span style={{
                    ...bs,
                    fontSize: 10, fontWeight: 700, padding: '3px 9px',
                    borderRadius: 20, whiteSpace: 'nowrap' as const, flexShrink: 0,
                  }}>
                    {isEarned ? '✓ EARNED' : canTake ? 'AVAILABLE' : '🔒'}
                  </span>
                </div>

                <div style={{ padding: '14px 16px' }}>

                  {/* Topic tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 5, marginBottom: 14 }}>
                    {meta.topics.map(t => (
                      <span key={t} className="badge badge-blue" style={{ fontSize: 10 }}>{t}</span>
                    ))}
                  </div>

                  {/* Stats box */}
                  <div style={{
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '10px 12px', marginBottom: 14,
                    fontSize: 11, fontFamily: 'monospace',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ color: 'var(--text3)' }}>Questions</span>
                      <span>{course.questions.length} — no multiple choice hints</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ color: 'var(--text3)' }}>Passing Score</span>
                      <span style={{ color: 'var(--gr)' }}>{course.passingScore}%+</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text3)' }}>XP Required</span>
                      <span style={{ color: canTake ? 'var(--gr)' : 'var(--red)' }}>
                        {course.xpRequired === 0 ? 'Free' : `${course.xpRequired.toLocaleString()} XP`}
                        {' '}{canTake ? '✓' : `— need ${(course.xpRequired - userXp).toLocaleString()} more`}
                      </span>
                    </div>
                  </div>

                  {/* Footer action */}
                  {isEarned ? (
                    <>
                      <div style={{
                        background: 'rgba(249,199,79,0.08)', border: '1px solid rgba(249,199,79,0.3)',
                        borderRadius: 'var(--radius)', padding: '10px 12px', marginBottom: 10,
                      }}>
                        <div style={{ fontSize: 11, color: 'var(--yellow)', fontFamily: 'monospace', fontWeight: 700, marginBottom: 3 }}>
                          {meta.icon} DIPLOMA EARNED
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text3)' }}>
                          {course.course} · Score: {earnedRecord?.score ?? '—'}%
                        </div>
                      </div>
                      <button
                        className="btn"
                        style={{
                          width: '100%', fontSize: 13, fontWeight: 700,
                          background: 'rgba(249,199,79,0.12)', color: 'var(--yellow)',
                          border: '1px solid rgba(249,199,79,0.4)',
                        }}
                      >
                        📥 Download PDF Diploma
                      </button>
                    </>
                  ) : canTake ? (
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', padding: 11, fontSize: 13, fontWeight: 700 }}
                      onClick={() => startExam(course)}
                    >
                      Take Exam → {course.questions.length} Questions
                    </button>
                  ) : (
                    <button
                      className="btn btn-secondary"
                      style={{ width: '100%', fontSize: 13, opacity: 0.5, cursor: 'not-allowed' }}
                      disabled
                    >
                      🔒 Need {(course.xpRequired - userXp).toLocaleString()} more XP
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Exam modal ── */}
      {activeExam && !examResult && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 700, width: '95vw', maxHeight: '88vh', overflowY: 'auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>
                {COURSE_META[activeExam.id]?.icon ?? '📜'}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{activeExam.course} Exam</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'monospace' }}>
                  {activeExam.questions.length} questions · {activeExam.passingScore}%+ to pass · Intensive
                </div>
              </div>
              <span style={{
                background: 'rgba(249,199,79,0.15)', color: 'var(--yellow)',
                border: '1px solid rgba(249,199,79,0.4)',
                fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
              }}>
                {COURSE_META[activeExam.id]?.level?.toUpperCase() ?? 'EXAM'}
              </span>
            </div>

            {/* Questions */}
            {activeExam.questions.map((q, qi) => (
              <div key={qi} className="card" style={{ marginBottom: 10, padding: 0, overflow: 'hidden' }}>
                <div style={{
                  background: 'var(--surface)', padding: '8px 14px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)' }}>Q{qi + 1}</span>
                  {examAnswers[qi] !== undefined && (
                    <span className="badge badge-green" style={{ fontSize: 10 }}>✓ ANSWERED</span>
                  )}
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, lineHeight: 1.55 }}>
                    {q.q}
                  </div>
                  {q.options.map((opt, oi) => {
                    const selected = examAnswers[qi] === oi;
                    return (
                      <div
                        key={oi}
                        onClick={() => handleAnswer(qi, oi)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 12px', marginBottom: 8,
                          borderRadius: 'var(--radius)', cursor: 'pointer',
                          background: selected ? 'var(--gr-dim)' : 'var(--surface)',
                          border: `1px solid ${selected ? 'var(--gr)' : 'var(--border)'}`,
                          transition: 'var(--transition)',
                        }}
                      >
                        <div style={{
                          width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700,
                          background: selected ? 'var(--gr)' : 'var(--surface2)',
                          color: selected ? 'var(--bg)' : 'var(--text3)',
                        }}>
                          {'ABCD'[oi]}
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text)', flex: 1 }}>{opt}</span>
                        {selected && <span style={{ color: 'var(--gr)', fontSize: 13 }}>✓</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Footer */}
            <div style={{ textAlign: 'center', padding: '12px 0 4px' }}>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>
                Answered: {answeredCount} / {activeExam.questions.length}
              </div>
              <button
                className="btn btn-primary"
                style={{ padding: '11px 30px', fontSize: 13, marginRight: 10 }}
                onClick={handleSubmit}
                disabled={answeredCount < activeExam.questions.length}
              >
                Submit Exam →
              </button>
              <button
                className="btn btn-secondary"
                style={{ padding: '11px 16px' }}
                onClick={closeModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Result modal ── */}
      {activeExam && examResult && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 500, textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 14 }}>
              {examResult.passed ? '🏆' : '📚'}
            </div>
            <div style={{
              fontSize: 20, fontWeight: 700, marginBottom: 8, fontFamily: 'monospace',
              color: examResult.passed ? 'var(--yellow)' : 'var(--gr)',
            }}>
              {examResult.passed ? 'DIPLOMA EARNED!' : 'NOT QUITE — KEEP STUDYING'}
            </div>
            <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--text)', marginBottom: 6, fontFamily: 'monospace' }}>
              {examResult.pct}%
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 20 }}>
              {examResult.score}/{activeExam.questions.length} correct · Need {activeExam.passingScore}%+ to pass
            </div>

            {examResult.passed ? (
              <>
                <div style={{
                  background: 'rgba(249,199,79,0.08)', border: '1px solid rgba(249,199,79,0.3)',
                  borderRadius: 'var(--radius)', padding: '14px 18px', marginBottom: 16,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--yellow)', marginBottom: 4 }}>
                    {COURSE_META[activeExam.id]?.icon} Diploma Added to Your Profile
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                    {activeExam.course} · {examResult.pct}% · InterStock USA · BBB Accredited
                  </div>
                </div>
                <div className="xp-tag" style={{ marginBottom: 16 }}>+300 XP earned</div>
                <button className="btn" style={{
                  width: '100%', marginBottom: 8, fontSize: 13, fontWeight: 700,
                  background: 'rgba(249,199,79,0.12)', color: 'var(--yellow)',
                  border: '1px solid rgba(249,199,79,0.4)',
                }}>
                  📥 Download PDF Diploma
                </button>
                <button className="btn btn-secondary" style={{ width: '100%', fontSize: 13 }} onClick={closeModal}>
                  Close
                </button>
              </>
            ) : (
              <>
                <div style={{
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 20,
                  fontSize: 13, color: 'var(--text2)', lineHeight: 1.55,
                }}>
                  📖 Review your study materials and try again. No limit on retakes.
                  You need {activeExam.passingScore}%+ to earn the diploma.
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <button className="btn btn-secondary" onClick={closeModal}>Back to Diplomas</button>
                  <button
                    className="btn btn-primary"
                    onClick={() => { setExamAnswers({}); setExamResult(null); }}
                  >
                    Retake Exam
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
