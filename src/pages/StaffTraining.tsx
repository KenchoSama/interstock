import { useApp } from '../state/AppContext';
import { TRAINING } from '../data/training';

export default function StaffTraining() {
  const { state, dispatch } = useApp();
  const { moduleId, lessonId, completed, certView } = state.training;

  if (certView === 'lesson' && moduleId) {
    const mod = TRAINING.find(m => m.id === moduleId)!;
    const lessonObj = lessonId ? mod.lessons.find(l => l.id === lessonId) : mod.lessons[0];

    return (
      <div>
        <div className="page-header">
          <div>
            <div className="page-title">{mod.title}</div>
            <div className="page-subtitle">{lessonObj?.title}</div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => dispatch({ type: 'SET_TRAINING_MODULE', moduleId: null })}
          >
            ← All Modules
          </button>
        </div>
        <div className="page-body">
          <div className="grid-2" style={{ alignItems: 'start' }}>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-title">Lessons</div>
              {mod.lessons.map(l => (
                <button
                  key={l.id}
                  className={`nav-item ${l.id === (lessonId || mod.lessons[0].id) ? 'active' : ''}`}
                  style={{ borderRadius: 6, marginBottom: 2 }}
                  onClick={() => dispatch({ type: 'SET_TRAINING_LESSON', lessonId: l.id })}
                >
                  <span>{completed.includes(l.id) ? '✓ ' : ''}{l.title}</span>
                </button>
              ))}
            </div>
            <div className="card">
              <div style={{ whiteSpace: 'pre-line', lineHeight: 1.8, fontSize: 14, color: 'var(--text)', marginBottom: 20 }}>
                {lessonObj?.content}
              </div>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (lessonObj) dispatch({ type: 'COMPLETE_LESSON', lessonId: lessonObj.id });
                  const idx = mod.lessons.findIndex(l => l.id === lessonObj?.id);
                  if (idx < mod.lessons.length - 1) {
                    dispatch({ type: 'SET_TRAINING_LESSON', lessonId: mod.lessons[idx + 1].id });
                  } else {
                    dispatch({ type: 'SET_TRAINING_MODULE', moduleId: null });
                  }
                }}
              >
                {completed.includes(lessonObj?.id ?? '') ? 'Next Lesson →' : 'Complete & Next →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const completedModules = TRAINING.filter(m =>
    m.lessons.every(l => completed.includes(l.id))
  ).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div className="page-header">
        <div>
          <div className="page-title">Staff Training 📚</div>
          <div className="page-subtitle">{completedModules}/{TRAINING.length} modules completed</div>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => dispatch({ type: 'SET_VIEW', view: 'cert-exam' })}
        >
          🎓 Take Certification Exam
        </button>
      </div>
      <div className="page-body">
        <div className="progress-bar" style={{ height: 8, marginBottom: 24 }}>
          <div className="progress-fill" style={{ width: `${(completedModules / TRAINING.length) * 100}%` }} />
        </div>

        {['Onboarding', 'Pedagogy', 'Partnerships', 'Content', 'Tools', 'Compliance', 'Programs'].map(cat => {
          const mods = TRAINING.filter(m => m.category === cat);
          if (!mods.length) return null;
          return (
            <div key={cat} style={{ marginBottom: 24 }}>
              <div className="section-title">{cat}</div>
              <div className="grid-2" style={{ gap: 12 }}>
                {mods.map(mod => {
                  const modCompleted = mod.lessons.every(l => completed.includes(l.id));
                  const modPct = Math.round((mod.lessons.filter(l => completed.includes(l.id)).length / mod.lessons.length) * 100);
                  return (
                    <div
                      key={mod.id}
                      className="card"
                      style={{ cursor: 'pointer', borderColor: modCompleted ? 'var(--gr2)' : undefined }}
                      onClick={() => dispatch({ type: 'SET_TRAINING_MODULE', moduleId: mod.id })}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ fontWeight: 600 }}>{mod.title}</div>
                        {modCompleted && <span style={{ color: 'var(--gr)' }}>✓</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>
                        {mod.description}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>
                        <span>⏱ {mod.duration}</span>
                        <span>{mod.lessons.length} lessons</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${modPct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
