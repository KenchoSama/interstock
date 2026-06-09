import { useApp } from '../state/AppContext';

interface Badge {
  id: string;
  name: string;
  desc: string;
  icon: string;
}

const ALL_BADGES: Badge[] = [
  { id: 'portfolio-builder',  name: 'Portfolio Builder',   desc: '5+ positions open',           icon: '📊' },
  { id: 'quiz-ace',           name: 'Quiz Ace',            desc: '90%+ on 3 quizzes',           icon: '⭐' },
  { id: 'first-trade',        name: 'First Trade',         desc: 'First paper trade',            icon: '📈' },
  { id: 'consistent-learner', name: 'Consistent Learner',  desc: 'Active 7 days',               icon: '🔥' },
  { id: 'mentor-matched',     name: 'Mentor Matched',      desc: 'Partner mentor assigned',     icon: '🤝' },
  { id: 'scenario-survivor',  name: 'Scenario Survivor',   desc: 'Complete a Scenario Challenge', icon: '🎯' },
  { id: 'options-initiate',   name: 'Options Initiate',    desc: 'First options trade',         icon: '⚡' },
  { id: 'etf-architect',      name: 'ETF Architect',       desc: 'Submit ETF to competition',   icon: '🏗️' },
  { id: 'level-1-graduate',   name: 'Level 1 Graduate',    desc: 'Complete all Level 1 lessons', icon: '🎓' },
  { id: 'top-10-nationally',  name: 'Top 10 Nationally',   desc: 'Top 10 nationally',           icon: '🥉' },
  { id: 'diploma-earner',     name: 'Diploma Earner',      desc: 'Pass a diploma exam',         icon: '📜' },
  { id: 'internship-earner',  name: 'Internship Earner',   desc: 'Apply for an internship',     icon: '💼' },
];

export default function Achievements() {
  const { state } = useApp();
  const user = state.u[state.role];
  const earnedIds = new Set(user.achievements ?? []);

  function isEarned(id: string): boolean {
    if (id === 'portfolio-builder')  return user.portfolio.length >= 3;
    if (id === 'quiz-ace')           return earnedIds.has('first-lesson');
    if (id === 'first-trade')        return earnedIds.has('first-trade');
    if (id === 'consistent-learner') return user.xp >= 100;
    if (id === 'mentor-matched')     return state.mentors.some(m => m.available);
    if (id === 'scenario-survivor')  return state.game.score > 0;
    if (id === 'options-initiate')   return false;
    if (id === 'etf-architect')      return state.etf !== null;
    if (id === 'level-1-graduate')   return user.xp >= 500;
    if (id === 'top-10-nationally')  return false;
    if (id === 'diploma-earner')     return user.diplomas.some(d => d.earned);
    if (id === 'internship-earner')  return false;
    return false;
  }

  const earnedCount = ALL_BADGES.filter(b => isEarned(b.id)).length;
  const totalCount = ALL_BADGES.length;
  const completePct = Math.round((earnedCount / totalCount) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-body">
        {/* Summary card */}
        <div className="stat-card" style={{ marginBottom: 16, display: 'inline-block', minWidth: 160 }}>
          <div className="stat-label">Badges Earned</div>
          <div className="stat-value">{earnedCount}/{totalCount}</div>
          <div className="stat-sub" style={{ color: '#00e676' }}>{completePct}% complete</div>
        </div>

        {/* Badge grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {ALL_BADGES.map(badge => {
            const earned = isEarned(badge.id);
            return (
              <div
                key={badge.id}
                className="card"
                style={{
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  opacity: earned ? 1 : 0.4,
                  borderColor: earned ? 'rgba(0,230,118,0.25)' : undefined,
                  background: earned ? 'rgba(0,230,118,0.06)' : undefined,
                }}
              >
                {/* Icon box */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    background: earned ? 'rgba(0,230,118,0.15)' : 'var(--surface2)',
                    border: `1px solid ${earned ? 'rgba(0,230,118,0.3)' : 'var(--border)'}`,
                  }}
                >
                  {badge.icon}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                    {badge.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {badge.desc}
                  </div>
                </div>

                {/* Earned / locked indicator */}
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    background: earned ? 'rgba(0,230,118,0.15)' : 'var(--surface2)',
                    border: `1px solid ${earned ? 'rgba(0,230,118,0.3)' : 'var(--border)'}`,
                  }}
                >
                  {earned ? <span style={{ color: '#00e676' }}>✓</span> : <span style={{ color: 'var(--text3)' }}>🔒</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
