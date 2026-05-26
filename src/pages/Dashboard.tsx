import { useMemo } from 'react';
import { useApp, getLevelName, getNextLevelXP } from '../state/AppContext';
import { STOCKS } from '../data/stocks';
import { DIPLOMA_COURSES } from '../data/courses';
import { genPrices, lineChart } from '../utils/charts';

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const user = state.u[state.role];

  const portfolioValue = useMemo(() => {
    return user.portfolio.reduce((sum, h) => {
      const stock = STOCKS.find(s => s.sym === h.sym);
      const price = stock ? stock.price : h.price;
      return sum + h.shares * price;
    }, 0);
  }, [user.portfolio]);

  const totalValue = portfolioValue + user.cash;
  const levelName = getLevelName(user.xp);
  const nextXP = getNextLevelXP(user.xp);
  const prevThresholds = [0, 100, 200, 500, 1000, 1200, 1500, 2000, 2500, 3000];
  const prevThreshold = [...prevThresholds].reverse().find(t => t <= user.xp) ?? 0;
  const xpProgress = nextXP > prevThreshold
    ? ((user.xp - prevThreshold) / (nextXP - prevThreshold)) * 100
    : 100;

  const diplomasEarned = user.diplomas.filter(d => d.earned).length;
  const diplomasTotal = DIPLOMA_COURSES.length;
  const diplomaPct = Math.round((diplomasEarned / diplomasTotal) * 100);

  const chartPrices = useMemo(() => genPrices(totalValue, 30, 0.01), []);
  const chartSvg = lineChart(chartPrices, 400, 120);

  const portfolioChange = portfolioValue > 0
    ? user.portfolio.reduce((sum, h) => {
        const stock = STOCKS.find(s => s.sym === h.sym);
        const price = stock ? stock.price : h.price;
        return sum + (price - h.avg) * h.shares;
      }, 0)
    : 0;

  return (
    <div className="page-body">
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
              Welcome back, {user.name.split(' ')[0]}
            </h1>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>
              Here&apos;s your financial learning dashboard
            </div>
          </div>
          <span className="level-badge">{levelName}</span>
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>XP Progress</span>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>
              {user.xp.toLocaleString()} / {nextXP.toLocaleString()} XP
            </span>
          </div>
          <div className="progress-bar" style={{ height: 10 }}>
            <div
              className="progress-fill"
              style={{ width: `${Math.min(xpProgress, 100)}%` }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>{levelName}</span>
            <span style={{ fontSize: 11, color: 'var(--gr)' }}>
              {(nextXP - user.xp).toLocaleString()} XP to next level
            </span>
          </div>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Portfolio Value</div>
          <div className="stat-value">${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className={`stat-sub ${portfolioChange >= 0 ? 'up' : 'dn'}`}>
            {portfolioChange >= 0 ? '+' : ''}{portfolioChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} P&amp;L
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Cash Balance</div>
          <div className="stat-value">${user.cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="stat-sub">Available to invest</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total XP</div>
          <div className="stat-value" style={{ color: 'var(--gr)' }}>{user.xp.toLocaleString()}</div>
          <div className="stat-sub">{levelName}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Diploma Progress</div>
          <div className="stat-value">{diplomasEarned}/{diplomasTotal}</div>
          <div className="stat-sub up">{diplomaPct}% complete</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        <div className="card">
          <div className="section-title">Portfolio Performance</div>
          <div className="chart-wrap" dangerouslySetInnerHTML={{ __html: chartSvg }} />
          <div style={{ marginTop: 12 }}>
            {user.portfolio.length === 0 ? (
              <div style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>
                No holdings yet. Start trading to build your portfolio.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {user.portfolio.slice(0, 4).map(h => {
                  const stock = STOCKS.find(s => s.sym === h.sym);
                  const price = stock ? stock.price : h.price;
                  const gain = (price - h.avg) * h.shares;
                  const gainPct = ((price - h.avg) / h.avg) * 100;
                  return (
                    <div key={h.sym} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--text)' }}>{h.sym}</span>
                        <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 8 }}>{h.shares} shares</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>${(price * h.shares).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div style={{ fontSize: 11, color: gain >= 0 ? 'var(--gr)' : 'var(--red)' }}>
                          {gain >= 0 ? '+' : ''}{gainPct.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="section-title">Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'flex-start', gap: 10 }}
              onClick={() => dispatch({ type: 'SET_VIEW', view: 'portfolio' })}
            >
              <span style={{ fontSize: 18 }}>📈</span> View Portfolio & Trade
            </button>
            <button
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'flex-start', gap: 10 }}
              onClick={() => dispatch({ type: 'SET_VIEW', view: 'game' })}
            >
              <span style={{ fontSize: 18 }}>🎮</span> Play Scenario Challenge
            </button>
            <button
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'flex-start', gap: 10 }}
              onClick={() => dispatch({ type: 'SET_VIEW', view: 'diplomas' })}
            >
              <span style={{ fontSize: 18 }}>🎓</span> View Diplomas
            </button>
            <button
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'flex-start', gap: 10 }}
              onClick={() => dispatch({ type: 'SET_VIEW', view: 'ai' })}
            >
              <span style={{ fontSize: 18 }}>🤖</span> Ask FinBot AI Tutor
            </button>
          </div>

          <div style={{ marginTop: 20, padding: '14px 16px', background: 'var(--bg3)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
              Diplomas
            </div>
            <div className="progress-bar" style={{ marginBottom: 6 }}>
              <div className="progress-fill" style={{ width: `${diplomaPct}%` }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>
              {diplomasEarned} of {diplomasTotal} diplomas earned
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
