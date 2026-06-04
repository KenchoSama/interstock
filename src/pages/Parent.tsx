import { STOCKS } from '../data';

const CHILD = {
  name: 'Jordan Williams',
  grade: '11th Grade — Lincoln High School',
  xp: 1450,
  level: 'Junior Analyst',
  cash: 90931,
  portfolio: [
    { sym: 'AAPL', shares: 10, avg: 178.50 },
    { sym: 'NVDA', shares: 5, avg: 820.00 },
  ],
  recentActivity: [
    { date: '2026-05-20', action: 'Completed lesson: "How the Stock Market Works"', xp: 25 },
    { date: '2026-05-18', action: 'Scored 11/15 on Scenario Challenge', xp: 110 },
    { date: '2026-05-15', action: 'Bought 5 shares of NVDA', xp: 10 },
    { date: '2026-05-12', action: 'Earned "Student of the Market" achievement', xp: 0 },
  ],
};

export default function Parent() {
  const portfolioValue = CHILD.portfolio.reduce((s, h) => {
    const stock = STOCKS.find(st => st.sym === h.sym);
    return s + h.shares * (stock?.price ?? h.avg);
  }, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Parent View 👨‍👧</div>
          <div className="page-subtitle">Monitor your child's financial literacy progress</div>
        </div>
      </div>
      <div className="page-body">
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--gr2), var(--gr))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 700, color: 'var(--bg)',
            }}>J</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{CHILD.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>{CHILD.grade}</div>
              <div className="level-badge" style={{ display: 'inline-flex', marginTop: 4 }}>⚡ {CHILD.level}</div>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-label">Total XP Earned</div>
              <div className="stat-value" style={{ color: 'var(--gr)' }}>{CHILD.xp.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Portfolio Value</div>
              <div className="stat-value">${portfolioValue.toFixed(0)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Cash Balance</div>
              <div className="stat-value">${CHILD.cash.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Holdings</div>
              <div className="stat-value">{CHILD.portfolio.length}</div>
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ gap: 20 }}>
          <div className="card">
            <div className="card-title">Recent Activity</div>
            {CHILD.recentActivity.map((a, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 13 }}>{a.action}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{a.date}</div>
                </div>
                {a.xp > 0 && <span className="xp-tag">+{a.xp} XP</span>}
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-title">Portfolio Holdings</div>
            {CHILD.portfolio.map(h => {
              const stock = STOCKS.find(s => s.sym === h.sym);
              const current = stock?.price ?? h.avg;
              const gl = (current - h.avg) / h.avg * 100;
              return (
                <div key={h.sym} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{h.sym}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{h.shares} shares @ ${h.avg}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div>${(current * h.shares).toFixed(2)}</div>
                    <div style={{ fontSize: 11 }} className={gl >= 0 ? 'up' : 'dn'}>
                      {gl >= 0 ? '+' : ''}{gl.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
