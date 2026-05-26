import { useApp, getLevelName } from '../state/AppContext';

interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  xpReq: number;
  category: string;
}

const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-trade', name: 'First Trade', desc: 'Execute your first buy order', icon: '📈', xpReq: 0, category: 'Trading' },
  { id: 'first-lesson', name: 'Student of the Market', desc: 'Complete your first lesson', icon: '📚', xpReq: 0, category: 'Learning' },
  { id: 'game-master', name: 'Game Master', desc: 'Score 10/15 or higher in Scenario Challenge', icon: '🎯', xpReq: 0, category: 'Games' },
  { id: 'perfect-game', name: 'Perfect Score', desc: 'Score 15/15 in Scenario Challenge', icon: '💯', xpReq: 0, category: 'Games' },
  { id: 'level-5', name: 'Halfway There', desc: 'Complete Level 5 in Level Up Game', icon: '🗺️', xpReq: 300, category: 'Games' },
  { id: 'level-10', name: 'Wall Street Warrior', desc: 'Complete all 10 levels', icon: '🏆', xpReq: 1000, category: 'Games' },
  { id: 'diploma-1', name: 'Certified Learner', desc: 'Earn your first diploma', icon: '🎓', xpReq: 500, category: 'Diplomas' },
  { id: 'diploma-all', name: 'Master of Finance', desc: 'Earn all 4 diplomas', icon: '👑', xpReq: 2000, category: 'Diplomas' },
  { id: 'portfolio-10k', name: 'Growing Investor', desc: 'Reach $110,000 in total portfolio value', icon: '💰', xpReq: 0, category: 'Trading' },
  { id: 'intern', name: 'Intern', desc: 'Apply for a real internship opportunity', icon: '💼', xpReq: 2500, category: 'Career' },
  { id: 'field-trip', name: 'Wall Street Tourist', desc: 'Enroll in a field trip', icon: '✈️', xpReq: 3000, category: 'Career' },
  { id: 'trader', name: 'Trader', desc: 'Reach 1,200 XP', icon: '⚡', xpReq: 1200, category: 'XP Milestones' },
  { id: 'analyst', name: 'Junior Analyst', desc: 'Reach 1,500 XP', icon: '🔍', xpReq: 1500, category: 'XP Milestones' },
  { id: 'senior', name: 'Senior Analyst', desc: 'Reach 2,000 XP', icon: '⭐', xpReq: 2000, category: 'XP Milestones' },
  { id: 'fund-mgr', name: 'Fund Manager', desc: 'Reach 2,500 XP', icon: '🏦', xpReq: 2500, category: 'XP Milestones' },
  { id: 'pro', name: 'Wall Street Pro', desc: 'Reach 3,000 XP', icon: '🌟', xpReq: 3000, category: 'XP Milestones' },
];

export default function Achievements() {
  const { state } = useApp();
  const user = state.u[state.role];
  const earned = new Set(user.achievements ?? []);
  const categories = [...new Set(ALL_ACHIEVEMENTS.map(a => a.category))];

  const totalEarned = ALL_ACHIEVEMENTS.filter(a =>
    earned.has(a.id) || user.xp >= a.xpReq && a.xpReq > 0
  ).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Achievements 🏅</div>
          <div className="page-subtitle">{totalEarned} / {ALL_ACHIEVEMENTS.length} unlocked · {getLevelName(user.xp)}</div>
        </div>
      </div>
      <div className="page-body">
        <div className="stats-row" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-label">Current Level</div>
            <div className="stat-value">{getLevelName(user.xp)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total XP</div>
            <div className="stat-value" style={{ color: 'var(--gr)' }}>{user.xp.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Achievements</div>
            <div className="stat-value">{totalEarned}/{ALL_ACHIEVEMENTS.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Diplomas Earned</div>
            <div className="stat-value">{user.diplomas.filter(d => d.earned).length}/4</div>
          </div>
        </div>

        {categories.map(cat => (
          <div key={cat} style={{ marginBottom: 24 }}>
            <div className="section-title">{cat}</div>
            <div className="grid-auto">
              {ALL_ACHIEVEMENTS.filter(a => a.category === cat).map(ach => {
                const unlocked = earned.has(ach.id) || (ach.xpReq > 0 && user.xp >= ach.xpReq);
                return (
                  <div
                    key={ach.id}
                    className="card"
                    style={{
                      opacity: unlocked ? 1 : 0.4,
                      borderColor: unlocked ? 'var(--gr2)' : undefined,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{unlocked ? ach.icon : '🔒'}</div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{ach.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)' }}>{ach.desc}</div>
                    {ach.xpReq > 0 && !unlocked && (
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
                        {ach.xpReq.toLocaleString()} XP required
                      </div>
                    )}
                    {unlocked && (
                      <div className="badge badge-green" style={{ marginTop: 8 }}>Earned</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
