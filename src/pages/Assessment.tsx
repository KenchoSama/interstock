// src/pages/Assessment.tsx
// Pre-program baseline assessment — 3 parts:
//   Part 1: Financial literacy knowledge quiz (10 questions, 10 pts each)
//   Part 2: Confidence self-assessment (5 sliders, 1–5 scale)
//   Part 3: Short answer reflection (5 open-ended questions)
//
// On submit: scores are stored to Supabase assessments table.

import { useState, useEffect } from 'react';
import { useApp } from '../state/AppContext';
import { supabase } from '../lib/supabase';

// ─── Part 1: Knowledge Quiz ───────────────────────────────────────────────────
const QUIZ: { q: string; opts: string[]; a: number }[] = [
  {
    q: 'What is a stock?',
    opts: [
      'A loan from a bank',
      'A share of ownership in a company',
      'A government savings bond',
      'A type of insurance policy',
    ],
    a: 1,
  },
  {
    q: 'What is a bond?',
    opts: [
      'Equity ownership in a startup',
      'A contract to buy stocks later',
      'A loan you give to a company or government in exchange for interest',
      'A savings account with fixed returns',
    ],
    a: 2,
  },
  {
    q: 'What does diversification mean?',
    opts: [
      'Putting all your money into one great stock',
      'Spreading investments across different assets to reduce risk',
      'Buying only international stocks',
      'Investing only in index funds',
    ],
    a: 1,
  },
  {
    q: 'What is inflation?',
    opts: [
      'When stock prices go up',
      'When interest rates fall',
      'The general rise in prices over time, reducing purchasing power',
      'When a company issues more shares',
    ],
    a: 2,
  },
  {
    q: 'What does "risk vs reward" mean in investing?',
    opts: [
      'Higher potential returns usually come with higher potential losses',
      'Safe investments always earn more',
      'Risk only applies to cryptocurrency',
      'Reward is guaranteed if you wait long enough',
    ],
    a: 0,
  },
  {
    q: 'What is compound interest?',
    opts: [
      'Interest paid only on the original deposit',
      'A fee charged by brokers',
      'Interest earned on both the principal and previously earned interest',
      'A type of government bond',
    ],
    a: 2,
  },
  {
    q: 'What is a credit score?',
    opts: [
      'Your bank account balance',
      'A number that represents how reliably you repay debt',
      'The interest rate on your mortgage',
      'How much credit card debt you owe',
    ],
    a: 1,
  },
  {
    q: 'What is the purpose of a budget?',
    opts: [
      'To restrict spending entirely',
      'To track income and plan where your money goes',
      'To apply for a loan',
      'To calculate your net worth',
    ],
    a: 1,
  },
  {
    q: 'What causes stock prices to move?',
    opts: [
      'Only the company\'s profits',
      'Only government policy',
      'Supply and demand, influenced by earnings, news, and investor sentiment',
      'The number of employees a company has',
    ],
    a: 2,
  },
  {
    q: 'What is the key difference between saving and investing?',
    opts: [
      'Saving earns more than investing',
      'Saving keeps money safe with low returns; investing takes risk for higher potential growth',
      'Investing is only for wealthy people',
      'There is no difference',
    ],
    a: 1,
  },
];

// ─── Part 2: Confidence Sliders ───────────────────────────────────────────────
const CONFIDENCE_QUESTIONS = [
  'How confident are you managing money?',
  'How confident are you investing?',
  'How confident are you reading financial news?',
  'How confident are you creating a budget?',
  'How interested are you in finance?',
];

// ─── Part 3: Short Answer ─────────────────────────────────────────────────────
const SHORT_ANSWER_QUESTIONS = [
  'What do you hope to learn from InterStock?',
  'What does financial success mean to you?',
  'If someone gave you $10,000 today, what would you do with it?',
  'Have you ever invested before? Explain.',
  'What is one financial topic you find confusing?',
];

const CONFIDENCE_LABELS = ['', 'Very Low', 'Low', 'Moderate', 'High', 'Very High'];

type Part = 'intro' | 'profile' | 'quiz' | 'confidence' | 'short' | 'done';

interface SchoolResult {
  id: string;
  name: string;
}

export default function Assessment() {
  const { state, dispatch } = useApp();
  const user = state.u[state.role];

  const [part, setPart] = useState<Part>('intro');
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(QUIZ.length).fill(null));
  const [confidence, setConfidence] = useState<number[]>(Array(CONFIDENCE_QUESTIONS.length).fill(3));
  const [shortAnswers, setShortAnswers] = useState<string[]>(Array(SHORT_ANSWER_QUESTIONS.length).fill(''));
  const [submitting, setSubmitting] = useState(false);

  // ─── Profile info: grade, age, school ────────────────────────────────────
  const [grade, setGrade] = useState<number | null>(null);
  const [age, setAge] = useState<number | null>(null);
  const [schools, setSchools] = useState<SchoolResult[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');

  useEffect(() => {
    supabase.from('schools').select('id, name').order('name').then(({ data }) => {
      setSchools(data ?? []);
      setSchoolsLoading(false);
    });
  }, []);

  const canProceedProfile = grade !== null && age !== null && age >= 10 && age <= 35 && selectedSchoolId !== '';

  // Scoring
  const quizScore = quizAnswers.reduce<number>(
    (sum, ans, i) => sum + (ans === QUIZ[i].a ? 10 : 0),
    0
  );
  const avgConfidence = (confidence.reduce((a, b) => a + b, 0) / confidence.length).toFixed(1);
  const allQuizAnswered = quizAnswers.every(a => a !== null);
  const MIN_SHORT_ANSWER_LENGTH = 100;
  const allShortFilled = shortAnswers.every(a => a.trim().length >= MIN_SHORT_ANSWER_LENGTH);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await supabase.from('assessments').insert({
        student_id: user.supabaseId,
        quiz_score: quizScore,
        quiz_answers: quizAnswers,
        confidence_scores: confidence,
        avg_confidence: parseFloat(avgConfidence),
        short_answers: shortAnswers,
      });
    } catch (_) {
      // Table may not exist yet — submit anyway
    }

    try {
      await supabase
        .from('profiles')
        .update({ grade, age, school_id: selectedSchoolId || null })
        .eq('id', user.supabaseId);
    } catch (_) {
      // Non-fatal — student can still proceed even if this update fails
    }

    dispatch({ type: 'UPDATE_STUDENT_INFO', grade, age, school_id: selectedSchoolId || null });
    dispatch({ type: 'ADD_XP', amount: 50 });
    dispatch({ type: 'SET_HAS_ASSESSMENT' });
    setPart('done');
    setSubmitting(false);
  }

  // ─── Progress indicator ─────────────────────────────────────────────────────
  const PARTS: Part[] = ['intro', 'profile', 'quiz', 'confidence', 'short', 'done'];
  const partIndex = PARTS.indexOf(part);
  const progress = Math.round((partIndex / (PARTS.length - 1)) * 100);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ height: '100vh', overflowY: 'auto', background: 'var(--bg)' }}>
    <div className="page-body" style={{ maxWidth: 720, margin: '0 auto' }}>

      {/* Header */}
      {part !== 'done' && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Baseline Assessment</h1>
              <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>
                This helps us measure your growth throughout the program.
              </div>
            </div>
            {part !== 'intro' && (
              <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'monospace' }}>
                {progress}% complete
              </span>
            )}
          </div>
          {part !== 'intro' && (
            <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 2 }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                background: 'var(--gr)',
                borderRadius: 2,
                transition: 'width 0.4s ease',
              }} />
            </div>
          )}
        </div>
      )}

      {/* ── INTRO ────────────────────────────────────────────────────────────── */}
      {part === 'intro' && (
        <div className="card" style={{ textAlign: 'center', padding: '40px 32px' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📋</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            Welcome, {user.name.split(' ')[0]}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 24, maxWidth: 480, margin: '0 auto 24px' }}>
            Before you start investing, we want to understand where you are today. This 3-part
            assessment takes about <strong style={{ color: 'var(--text)' }}>5–8 minutes</strong> and
            covers your financial knowledge, confidence, and goals. There are no wrong answers.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
            {[
              { icon: '🧠', label: 'Part 1', sub: '10 Knowledge Questions' },
              { icon: '💪', label: 'Part 2', sub: '5 Confidence Ratings' },
              { icon: '✍️', label: 'Part 3', sub: '5 Short Answers' },
            ].map(p => (
              <div key={p.label} style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '14px 20px',
                textAlign: 'center',
                minWidth: 140,
              }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{p.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{p.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{p.sub}</div>
              </div>
            ))}
          </div>
          <button
            className="btn btn-primary"
            style={{ padding: '12px 36px', fontSize: 15 }}
            onClick={() => setPart('profile')}
          >
            Start Assessment →
          </button>
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text3)' }}>
            +50 XP awarded on completion
          </div>
        </div>
      )}

      {/* ── PROFILE INFO ─────────────────────────────────────────────────────── */}
      {part === 'profile' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{
              background: 'rgba(77,159,255,0.12)', border: '1px solid #4d9fff',
              color: '#4d9fff', borderRadius: 6, padding: '3px 10px',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
            }}>BEFORE YOU START</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Tell us a bit about you</span>
          </div>

          <div className="card" style={{ marginBottom: 12, padding: '14px 18px' }}>
            <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
              This helps us tailor field trips, internships, and content to your grade level and school.
            </div>
          </div>

          {/* Grade */}
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: 'var(--text)' }}>
              What grade are you in?
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[9, 10, 11, 12].map(g => (
                <button
                  key={g}
                  onClick={() => setGrade(g)}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    borderRadius: 8,
                    border: `1.5px solid ${grade === g ? 'var(--gr)' : 'var(--border)'}`,
                    background: grade === g ? 'var(--gr-dim)' : 'var(--surface)',
                    color: grade === g ? 'var(--gr)' : 'var(--text2)',
                    fontWeight: grade === g ? 700 : 400,
                    fontSize: 15,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {g}th
                </button>
              ))}
            </div>
          </div>

          {/* Age */}
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: 'var(--text)' }}>
              How old are you?
            </div>
            <input
              type="number"
              min={10}
              max={35}
              placeholder="e.g. 16"
              value={age ?? ''}
              onChange={e => setAge(e.target.value === '' ? null : Number(e.target.value))}
              style={{
                width: 120,
                padding: '10px 14px',
                fontSize: 15,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text)',
              }}
            />
          </div>

          {/* School dropdown */}
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: 'var(--text)' }}>
              What school do you go to?
            </div>

            <select
              value={selectedSchoolId}
              onChange={e => setSelectedSchoolId(e.target.value)}
              disabled={schoolsLoading}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: 14,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text)',
                boxSizing: 'border-box',
              }}
            >
              <option value="" disabled>
                {schoolsLoading ? 'Loading schools...' : 'Select your school...'}
              </option>
              {schools.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            {!schoolsLoading && schools.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>
                No schools set up yet — ask your admin to add your school.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              className="btn btn-primary"
              style={{ padding: '11px 28px', opacity: canProceedProfile ? 1 : 0.4 }}
              disabled={!canProceedProfile}
              onClick={() => setPart('quiz')}
            >
              Next: Knowledge Quiz →
            </button>
          </div>
        </>
      )}

      {/* ── PART 1: QUIZ ─────────────────────────────────────────────────────── */}
      {part === 'quiz' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{
              background: 'var(--gr-dim)', border: '1px solid var(--gr)',
              color: 'var(--gr)', borderRadius: 6, padding: '3px 10px',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
            }}>PART 1 OF 3</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Financial Knowledge Quiz</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text3)', fontFamily: 'monospace' }}>
              {quizAnswers.filter(a => a !== null).length} / {QUIZ.length} answered
            </span>
          </div>

          {QUIZ.map((q, qi) => (
            <div key={qi} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                  background: quizAnswers[qi] !== null ? 'var(--gr-dim)' : 'var(--surface2)',
                  border: `1px solid ${quizAnswers[qi] !== null ? 'var(--gr)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                  color: quizAnswers[qi] !== null ? 'var(--gr)' : 'var(--text3)',
                }}>
                  {quizAnswers[qi] !== null ? '✓' : qi + 1}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.5 }}>
                  {q.q}
                  <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text3)', fontWeight: 400 }}>10 pts</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {q.opts.map((opt, oi) => (
                  <button
                    key={oi}
                    onClick={() => {
                      const updated = [...quizAnswers];
                      updated[qi] = oi;
                      setQuizAnswers(updated);
                    }}
                    style={{
                      textAlign: 'left',
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: `1.5px solid ${quizAnswers[qi] === oi ? 'var(--gr)' : 'var(--border)'}`,
                      background: quizAnswers[qi] === oi ? 'var(--gr-dim)' : 'var(--surface)',
                      color: quizAnswers[qi] === oi ? 'var(--gr)' : 'var(--text)',
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      background: quizAnswers[qi] === oi ? 'var(--gr)' : 'var(--surface2)',
                      border: `1px solid ${quizAnswers[qi] === oi ? 'var(--gr)' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700,
                      color: quizAnswers[qi] === oi ? '#000' : 'var(--text3)',
                    }}>
                      {['A', 'B', 'C', 'D'][oi]}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              className="btn btn-primary"
              style={{ padding: '11px 28px', opacity: allQuizAnswered ? 1 : 0.4 }}
              disabled={!allQuizAnswered}
              onClick={() => setPart('confidence')}
            >
              Next: Confidence Assessment →
            </button>
          </div>
        </>
      )}

      {/* ── PART 2: CONFIDENCE ───────────────────────────────────────────────── */}
      {part === 'confidence' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{
              background: 'rgba(77,159,255,0.12)', border: '1px solid #4d9fff',
              color: '#4d9fff', borderRadius: 6, padding: '3px 10px',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
            }}>PART 2 OF 3</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Confidence Self-Assessment</span>
          </div>

          <div className="card" style={{ marginBottom: 12, padding: '14px 18px' }}>
            <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
              Rate yourself honestly on a scale of <strong style={{ color: 'var(--text)' }}>1 to 5</strong>.
              This isn't a test — it helps us track how your confidence grows throughout the program.
              Research shows confidence sometimes improves faster than knowledge.
            </div>
          </div>

          {CONFIDENCE_QUESTIONS.map((q, qi) => (
            <div key={qi} className="card" style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text)' }}>
                {q}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map(v => (
                  <button
                    key={v}
                    onClick={() => {
                      const updated = [...confidence];
                      updated[qi] = v;
                      setConfidence(updated);
                    }}
                    style={{
                      flex: 1,
                      padding: '10px 0',
                      borderRadius: 8,
                      border: `1.5px solid ${confidence[qi] === v ? '#4d9fff' : 'var(--border)'}`,
                      background: confidence[qi] === v ? 'rgba(77,159,255,0.12)' : 'var(--surface)',
                      color: confidence[qi] === v ? '#4d9fff' : 'var(--text2)',
                      fontWeight: confidence[qi] === v ? 700 : 400,
                      fontSize: 16,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--text3)' }}>
                <span>Not confident</span>
                <span style={{ color: '#4d9fff', fontWeight: 600 }}>
                  {CONFIDENCE_LABELS[confidence[qi]]}
                </span>
                <span>Very confident</span>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <button className="btn btn-secondary" onClick={() => setPart('quiz')}>← Back</button>
            <button
              className="btn btn-primary"
              style={{ padding: '11px 28px' }}
              onClick={() => setPart('short')}
            >
              Next: Short Answer →
            </button>
          </div>
        </>
      )}

      {/* ── PART 3: SHORT ANSWER ─────────────────────────────────────────────── */}
      {part === 'short' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{
              background: 'rgba(249,199,79,0.12)', border: '1px solid var(--yellow)',
              color: 'var(--yellow)', borderRadius: 6, padding: '3px 10px',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
            }}>PART 3 OF 3</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Reflection Questions</span>
          </div>

          <div className="card" style={{ marginBottom: 12, padding: '14px 18px' }}>
            <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
              These short answers are the most valuable part of the assessment. Be honest —
              your responses help personalize your InterStock experience and will be reviewed by your instructor.
            </div>
          </div>

          {SHORT_ANSWER_QUESTIONS.map((q, qi) => {
            const charCount = shortAnswers[qi].trim().length;
            const meetsMin = charCount >= MIN_SHORT_ANSWER_LENGTH;
            return (
            <div key={qi} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 5, flexShrink: 0,
                  background: meetsMin ? 'rgba(249,199,79,0.12)' : 'var(--surface2)',
                  border: `1px solid ${meetsMin ? 'var(--yellow)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  color: meetsMin ? 'var(--yellow)' : 'var(--text3)',
                }}>
                  {qi + 1}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.5 }}>{q}</div>
              </div>
              <textarea
                rows={3}
                placeholder="Write your answer here... (at least 100 characters)"
                value={shortAnswers[qi]}
                onChange={e => {
                  const updated = [...shortAnswers];
                  updated[qi] = e.target.value;
                  setShortAnswers(updated);
                }}
                style={{
                  width: '100%',
                  resize: 'vertical',
                  padding: '10px 12px',
                  fontSize: 13,
                  background: 'var(--surface)',
                  border: `1px solid ${meetsMin ? 'var(--gr)' : 'var(--border)'}`,
                  borderRadius: 8,
                  color: 'var(--text)',
                  lineHeight: 1.6,
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ fontSize: 11, color: meetsMin ? 'var(--gr)' : 'var(--text3)', marginTop: 4, textAlign: 'right' }}>
                {meetsMin ? `✓ ${charCount} characters` : `${charCount} / ${MIN_SHORT_ANSWER_LENGTH} characters minimum`}
              </div>
            </div>
            );
          })}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <button className="btn btn-secondary" onClick={() => setPart('confidence')}>← Back</button>
            <button
              className="btn btn-primary"
              style={{ padding: '11px 28px', opacity: allShortFilled && !submitting ? 1 : 0.4 }}
              disabled={!allShortFilled || submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Submitting...' : 'Submit Assessment →'}
            </button>
          </div>
        </>
      )}

      {/* ── DONE ─────────────────────────────────────────────────────────────── */}
      {part === 'done' && (
        <div className="card" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎓</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Assessment Complete!</h2>
          <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 28, lineHeight: 1.7 }}>
            Great work, {user.name.split(' ')[0]}. Your baseline has been recorded.
            At the end of the program, you'll take this again and see exactly how much you've grown.
          </p>

          {/* Score summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '16px 12px',
            }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Knowledge Score</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: quizScore >= 70 ? 'var(--gr)' : quizScore >= 50 ? 'var(--yellow)' : 'var(--red)' }}>
                {quizScore}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>out of 100</div>
            </div>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '16px 12px',
            }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Confidence</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#4d9fff' }}>{avgConfidence}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>out of 5.0</div>
            </div>
            <div style={{
              background: 'var(--gr-dim)', border: '1px solid var(--gr)',
              borderRadius: 10, padding: '16px 12px',
            }}>
              <div style={{ fontSize: 11, color: 'var(--gr)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>XP Earned</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--gr)' }}>+50</div>
              <div style={{ fontSize: 11, color: 'var(--gr)' }}>added to your account</div>
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ padding: '12px 36px', fontSize: 15 }}
            onClick={() => dispatch({ type: 'SET_HAS_ASSESSMENT' })}
          >
            Enter InterStock →
          </button>
        </div>
      )}
    </div>
    </div>
  );
}
