import { useApp, getLevelName, getNextLevelXP } from '../state/AppContext';
import { STOCKS } from '../data';

export default function Profile() {
  const { state } = useApp();
  const user = state.u[state.role];
  const nextLvl = getNextLevelXP(user.xp);
  const prevLvl = [0, 100, 200, 500, 1000, 1200, 1500, 2000, 2500].filter(t => t <= user.xp).at(-1) ?? 0;
  const pct = Math.min(100, Math.round(((user.xp - prevLvl) / (nextLvl - prevLvl)) * 100));

  const portfolioValue = user.portfolio.reduce((sum, h) => {
    const stock = STOCKS.find(s => s.sym === h.sym);
    return sum + h.shares * (stock?.price ?? h.avg);
  }, 0);
  const totalValue = portfolioValue + user.cash;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Profile 👤</div>
      </div>
      <div className="page-body">
        <div className="grid-2" style={{ gap: 20, alignItems: 'start' }}>
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div
                  style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--gr2), var(--gr))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28, fontWeight: 700, color: 'var(--bg)',
                  }}
                >
                  {user.name[0]}
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{user.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)' }}>{user.email}</div>
                  <div className="level-badge" style={{ marginTop: 6, display: 'inline-flex' }}>
                    ⚡ {getLevelName(user.xp)}
                  </div>
                </div>
              </div>

              <div className="card-title">XP Progress</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>
                <span>{user.xp.toLocaleString()} XP</span>
                <span>→ {nextLvl.toLocaleString()} XP</span>
              </div>
              <div className="progress-bar" style={{ height: 10, marginBottom: 6 }}>
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                {nextLvl - user.xp} XP to {getLevelName(nextLvl)}
              </div>
            </div>

            <div className="card">
              <div className="card-title">Diplomas Earned</div>
              {user.diplomas.filter(d => d.earned).length === 0 ? (
                <div style={{ color: 'var(--text2)', fontSize: 13 }}>No diplomas yet. Take an exam!</div>
              ) : (
                user.diplomas.filter(d => d.earned).map(d => (
                  <div key={d.courseId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>🎓 {d.courseName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text2)' }}>Score: {d.score}% · {d.date}</div>
                    </div>
                    <span className="badge badge-green">Earned</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="stats-row" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 16 }}>
              <div className="stat-card">
                <div className="stat-label">Portfolio Value</div>
                <div className="stat-value">${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Cash Balance</div>
                <div className="stat-value">${user.cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Account</div>
                <div className="stat-value" style={{ color: 'var(--gr)' }}>${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Holdings</div>
                <div className="stat-value">{user.portfolio.length}</div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">Current Holdings</div>
              {user.portfolio.length === 0 ? (
                <div style={{ color: 'var(--text2)', fontSize: 13 }}>No holdings yet.</div>
              ) : (
                <table style={{ width: '100%' }}>
                  <tbody>
                    {user.portfolio.map(h => {
                      const stock = STOCKS.find(s => s.sym === h.sym);
                      const current = stock?.price ?? h.avg;
                      const gl = (current - h.avg) * h.shares;
                      const glPct = ((current - h.avg) / h.avg) * 100;
                      return (
                        <tr key={h.sym} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '10px 0' }}>
                            <div style={{ fontWeight: 600 }}>{h.sym}</div>
                            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{h.shares} shares</div>
                          </td>
                          <td style={{ textAlign: 'right', padding: '10px 0' }}>
                            <div>${(current * h.shares).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            <div style={{ fontSize: 11 }} className={gl >= 0 ? 'up' : 'dn'}>
                              {gl >= 0 ? '+' : ''}${gl.toFixed(2)} ({gl >= 0 ? '+' : ''}{glPct.toFixed(1)}%)
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
