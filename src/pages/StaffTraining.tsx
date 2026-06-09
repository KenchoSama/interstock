import { useState } from 'react';
import { useApp } from '../state/AppContext';
import { TRAINING } from '../data/training';

const MODULES = [
  { cat: 'Orientation', title: 'Welcome to InterStock — Program Overview',  dur: '45 min', preview: 'InterStock is a financial education company founded by Gabriel and Christian Kasabdji. We ...' },
  { cat: 'Curriculum',  title: 'Teaching Module 1: Personal Finance',        dur: '44 min', preview: 'Students will: Create a monthly budget, understand compound interest, describe the purpose...' },
  { cat: 'Curriculum',  title: 'Teaching Markets & First Trade',             dur: '75 min', preview: 'Students will: Explain the stock market, read a stock quote, understand stocks vs bonds, a...' },
  { cat: 'Curriculum',  title: 'Portfolio Building & ETF Builder',           dur: '60 min', preview: "Don't put all your eggs in one basket. Spread across sectors reduces risk without sacrificing..." },
  { cat: 'Curriculum',  title: 'Teaching Options & Derivatives',             dur: '55 min', preview: 'A call means you have the right to buy. If teaching has mastered, you have di...' },
  { cat: 'Operations',  title: 'Games, Competitions & Engagement',           dur: '40 min', preview: 'Create the experience to motivate and interest students. Gamification improves activity, test scores...' },
  { cat: 'Pedagogy',    title: 'XP & Gamification',                          dur: '30 min', preview: 'Students Motivated: Scenario Challenge (2150), Competitions (500), Field Trips (1,000)...' },
  { cat: 'Operations',  title: 'Partners, Mentors & Connections',            dur: '35 min', preview: 'Partners/Mentors/Connections: Are partners/mentors creating financial firms, which...' },
  { cat: 'Admin',       title: 'Assessment, Diplomas & Reporting',           dur: '50 min', preview: 'Students must pass internal exams (70%+) and earn downloadable PDF diplomas. Re-done...' },
];

const REQUIREMENTS = [
  { label: 'Complete all training modules', done: false },
  { label: 'Pass exam (80%+)',              done: false },
  { label: 'Sign Instructor Agreement',     done: true  },
  { label: 'Background check cleared',      done: true  },
  { label: 'School admin approval',         done: true  },
];

const CAT_STYLE: Record<string, { bg: string; color: string }> = {
  Orientation: { bg: 'var(--blue-dim)',                    color: 'var(--blue)'   },
  Curriculum:  { bg: 'rgba(0,230,118,0.10)',               color: '#00e676'       },
  Operations:  { bg: 'rgba(249,199,79,0.10)',              color: 'var(--yellow)' },
  Pedagogy:    { bg: 'rgba(150,100,220,0.12)',             color: '#a78bfa'       },
  Admin:       { bg: 'rgba(0,230,118,0.08)',               color: 'rgba(0,230,118,0.6)' },
};

function catBadge(cat: string) {
  const s = CAT_STYLE[cat] ?? { bg: 'var(--surface2)', color: 'var(--text3)' };
  return { display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: s.bg, color: s.color } as React.CSSProperties;
}

export default function StaffTraining() {
  const { state, dispatch } = useApp();
  const { completed } = state.training;
  const [view, setView] = useState<'list' | 'lesson'>('list');
  const [modIdx, setModIdx] = useState(0);

  function isModDone(i: number) {
    const tr = TRAINING[i];
    return tr ? tr.lessons.every(l => completed.includes(l.id)) : false;
  }

  const doneCount = MODULES.filter((_, i) => isModDone(i)).length;
  const pct = Math.round((doneCount / MODULES.length) * 100);
  const canExam = doneCount === MODULES.length;

  function openModule(i: number) {
    setModIdx(i);
    setView('lesson');
    dispatch({ type: 'SET_TRAINING_MODULE', moduleId: TRAINING[i]?.id ?? null });
  }

  function markComplete() {
    const tr = TRAINING[modIdx];
    if (tr) tr.lessons.forEach(l => dispatch({ type: 'COMPLETE_LESSON', lessonId: l.id }));
    setView('list');
  }

  // ── Lesson view ──────────────────────────────────────────────────────────
  if (view === 'lesson') {
    const mod = MODULES[modIdx];
    const trMod = TRAINING[modIdx];
    const isDone = isModDone(modIdx);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div className="page-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setView('list')}>← Back</button>
            <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#00e676' }}>{mod.title}</span>
          </div>

          {trMod?.lessons.map((l, li) => (
            <div key={l.id} className="card" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: 5, background: completed.includes(l.id) ? 'rgba(0,230,118,0.12)' : 'var(--surface2)', border: `1px solid ${completed.includes(l.id) ? 'rgba(0,230,118,0.3)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: completed.includes(l.id) ? '#00e676' : 'var(--text3)' }}>
                  {completed.includes(l.id) ? '✓' : li + 1}
                </div>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{l.title}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.8 }}>{l.content}</div>
            </div>
          ))}

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button
              className="btn btn-primary"
              style={{ padding: '11px 28px', fontSize: 13, background: 'linear-gradient(90deg, rgba(0,230,118,0.8), #00e676)', color: 'var(--bg)', fontWeight: 700 }}
              onClick={markComplete}
            >
              {isDone ? 'Review Complete ✓' : 'Mark Complete & Continue →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-body">

        {/* Stat cards */}
        <div className="stats-row" style={{ marginBottom: 20 }}>
          <div className="stat-card" style={{ borderLeft: '3px solid #00e676' }}>
            <div className="stat-label">Modules Done</div>
            <div className="stat-value">{doneCount}/{MODULES.length}</div>
            <div className="stat-sub" style={{ color: doneCount === MODULES.length ? '#00e676' : 'var(--text3)' }}>{pct}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Status</div>
            <div className="stat-value" style={{ fontSize: 13, color: canExam ? '#00e676' : 'var(--blue)' }}>
              {canExam ? 'READY' : 'IN PROGRESS'}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">School</div>
            <div className="stat-value" style={{ fontSize: 12 }}>Westlake HS</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Certification</div>
            <div className="stat-value" style={{ fontSize: 11, color: 'var(--text3)' }}>PENDING</div>
          </div>
        </div>

        {/* 2-col layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 16, alignItems: 'start' }}>

          {/* Main column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Curriculum card */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Training Curriculum</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 80, height: 5, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #00e676, var(--blue))', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--text3)' }}>{pct}%</span>
                </div>
              </div>
              <div style={{ padding: '6px 0' }}>
                {MODULES.map((m, i) => {
                  const done = isModDone(i);
                  const locked = !done && i > 0 && !isModDone(i - 1);
                  return (
                    <div
                      key={i}
                      style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', opacity: locked ? 0.45 : 1, cursor: locked ? 'default' : 'pointer', background: done ? 'rgba(0,230,118,0.03)' : undefined }}
                      onClick={() => !locked && openModule(i)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={catBadge(m.cat)}>{m.cat}</span>
                          <span style={{ fontWeight: 700, fontSize: 12 }}>{m.title}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--text3)' }}>{m.dur}</span>
                          {locked ? (
                            <span style={{ fontSize: 14 }}>🔒</span>
                          ) : done ? (
                            <>
                              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 4, background: 'rgba(0,230,118,0.12)', color: '#00e676', fontSize: 11, fontWeight: 700 }}>✓</span>
                              <button className="btn btn-secondary" style={{ fontSize: 10, padding: '2px 10px' }} onClick={e => { e.stopPropagation(); openModule(i); }}>Review</button>
                            </>
                          ) : (
                            <>
                              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 7px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: 'rgba(0,230,118,0.10)', color: '#00e676' }}>START</span>
                              <button className="btn btn-primary" style={{ fontSize: 10, padding: '2px 10px', background: 'linear-gradient(90deg, rgba(0,230,118,0.8), #00e676)', color: 'var(--bg)', fontWeight: 700 }} onClick={e => { e.stopPropagation(); openModule(i); }}>Study →</button>
                            </>
                          )}
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{m.preview}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Exam unlock / locked */}
            {canExam ? (
              <div className="card" style={{ border: '1px solid rgba(0,230,118,0.4)', background: 'rgba(0,230,118,0.04)', textAlign: 'center', padding: 24 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🎓</div>
                <div style={{ fontFamily: 'monospace', fontSize: 17, fontWeight: 700, color: '#00e676', marginBottom: 6 }}>ALL MODULES COMPLETE</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>15 questions · 80%+ to pass</div>
                <button
                  className="btn btn-primary"
                  style={{ padding: '11px 26px', fontSize: 13, background: 'linear-gradient(90deg, rgba(0,230,118,0.8), #00e676)', color: 'var(--bg)', fontWeight: 700 }}
                  onClick={() => dispatch({ type: 'SET_VIEW', view: 'cert-exam' })}
                >
                  Take Certification Exam →
                </button>
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: 22, opacity: 0.45 }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>🔒</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'monospace' }}>
                  Complete all {MODULES.length} modules to unlock the exam ({MODULES.length - doneCount} remaining)
                </div>
              </div>
            )}
          </div>

          {/* Requirements sidebar */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Requirements
            </div>
            <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {REQUIREMENTS.map(r => (
                <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 15, height: 15, borderRadius: 3, flexShrink: 0, background: r.done ? 'rgba(0,230,118,0.12)' : 'var(--surface2)', border: `1px solid ${r.done ? 'rgba(0,230,118,0.3)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: r.done ? '#00e676' : 'var(--text3)' }}>
                    {r.done ? '✓' : '○'}
                  </div>
                  <span style={{ fontSize: 12, color: r.done ? 'var(--text)' : 'var(--text3)' }}>{r.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
