import { useMemo, useState } from 'react';
import { useApp, getLevelName, getNextLevelXP, isLocked } from '../state/AppContext';
import { STOCKS, LB } from '../data/stocks';
import { DIPLOMA_COURSES } from '../data/courses';
import { genPrices, lineChart } from '../utils/charts';

const LEVEL_THRESHOLDS = [0, 100, 200, 500, 1000, 1200, 1500, 2000, 2500, 3000];
const ETF_COLORS = ['var(--gr)', '#4d9fff', '#f9c74f', '#a855f7', '#f97316'];
const SP500_YTD = 10.8;
const ETF_XP_REQUIRED = 1500;

const TF_OPTIONS = ['1D', '1W', '1M', '6M', '1Y'] as const;
type TfOption = typeof TF_OPTIONS[number];
const TF_CONFIG: Record<TfOption, { points: number; vol: number }> = {
  '1D': { points: 78, vol: 0.003 },
  '1W': { points: 35, vol: 0.006 },
  '1M': { points: 30, vol: 0.010 },
  '6M': { points: 26, vol: 0.015 },
  '1Y': { points: 52, vol: 0.020 },
};

const FEATURE_LIST = [
  { label: 'AI Tutor', view: 'ai' },
  { label: 'Scenario Game', view: 'game' },
  { label: 'Competitions', view: 'compete' },
  { label: 'Options', view: 'options' },
  { label: 'ETF Builder', view: 'etf' },
];

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

  const [chartTf, setChartTf] = useState<TfOption>('1Y');
  const chartPrices = useMemo(() => {
    const { points, vol } = TF_CONFIG[chartTf];
    return genPrices(totalValue, points, vol);
  }, [chartTf, totalValue]);
  const chartSvg = lineChart(chartPrices, 400, 120);

  const portfolioChange = portfolioValue > 0
    ? user.portfolio.reduce((sum, h) => {
        const stock = STOCKS.find(s => s.sym === h.sym);
        const price = stock ? stock.price : h.price;
        return sum + (price - h.avg) * h.shares;
      }, 0)
    : 0;

  const totalCost = user.portfolio.reduce((sum, h) => sum + h.avg * h.shares, 0);
  const myReturnPct = totalCost > 0 ? (portfolioChange / totalCost) * 100 : 0;

  const levelNum = LEVEL_THRESHOLDS.filter(t => t <= user.xp).length;
  const myRank = LB.findIndex(e => (e.returnPct ?? 0) < myReturnPct) + 1 || LB.length + 1;
  const assignedMentor = state.mentors.find(m => m.available) ?? state.mentors[0];
  const mentorInitials = assignedMentor.name.split(' ').map(n => n[0]).join('').slice(0, 2);

  const etfLocked = user.xp < ETF_XP_REQUIRED;
  const etfReturn = state.etf
    ? parseFloat((state.etf.holdings.reduce((sum, h) => {
        const stock = STOCKS.find(s => s.sym === h.sym);
        return sum + (stock ? stock.chgPct * (h.weight / 100) * 8 : 0);
      }, 0) + 8).toFixed(1))
    : 0;
  const etfAlpha = parseFloat((etfReturn - SP500_YTD).toFixed(1));

  return (
    <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Full-width top section */}
      <div>
        {/* Welcome header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
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

        {/* Four KPI cards — full width */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
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

      </div>

      {/* Two-column section below */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'nowrap', minWidth: 0 }}>
                <div className="section-title" style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0, marginRight: 8 }}>Portfolio Performance</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {TF_OPTIONS.map(tf => (
                    <button
                      key={tf}
                      className={`chart-tf-btn${chartTf === tf ? ' active' : ''}`}
                      onClick={() => setChartTf(tf)}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              <div className="chart-wrap" dangerouslySetInnerHTML={{ __html: chartSvg }} />
              <div style={{ marginTop: 12 }}>
                {user.portfolio.length === 0 ? (
                  <div style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>
                    No holdings yet. Start trading to build your portfolio.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 12 }}>
                    {user.portfolio.slice(0, 4).map(h => {
                      const stock = STOCKS.find(s => s.sym === h.sym);
                      const price = stock ? stock.price : h.price;
                      const gain = (price - h.avg) * h.shares;
                      const gainPct = ((price - h.avg) / h.avg) * 100;
                      return (
                        <div key={h.sym} style={{
                          flex: 1, padding: '12px 14px',
                          background: 'var(--bg3)', borderRadius: 'var(--radius)',
                          border: '1px solid var(--border)',
                        }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{h.sym}</div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                            ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: gain >= 0 ? 'var(--gr)' : 'var(--red)' }}>
                            {gain >= 0 ? '▲' : '▼'}{Math.abs(gainPct).toFixed(1)}%
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  className="btn btn-primary"
                  style={{ justifyContent: 'center', gap: 8, padding: '12px 16px' }}
                  onClick={() => dispatch({ type: 'SET_VIEW', view: 'game' })}
                >
                  🎮 Scenario Challenge
                </button>
                <button
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '12px 16px', borderRadius: 'var(--radius)', fontWeight: 500,
                    fontSize: 14, cursor: 'pointer', border: 'none',
                    background: 'var(--blue)', color: '#fff',
                  }}
                  onClick={() => dispatch({ type: 'SET_VIEW', view: 'level-game' })}
                >
                  🗺️ Level Up Game
                  <span style={{
                    fontSize: 9, fontWeight: 700, background: 'var(--yellow)', color: 'var(--bg)',
                    borderRadius: 4, padding: '2px 5px', letterSpacing: '0.5px',
                  }}>NEW</span>
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ justifyContent: 'center', gap: 8, padding: '12px 16px', color: 'var(--gr)', borderColor: 'var(--gr)' }}
                  onClick={() => dispatch({ type: 'SET_VIEW', view: 'portfolio' })}
                >
                  📈 Trade Stocks
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ justifyContent: 'center', gap: 8, padding: '12px 16px' }}
                  onClick={() => dispatch({ type: 'SET_VIEW', view: 'ai' })}
                >
                  🤖 FinBot AI
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

            {/* Build an ETF card */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div className="section-title" style={{ margin: 0 }}>🏦 Build an ETF</div>
                {!etfLocked && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => dispatch({ type: 'SET_VIEW', view: 'etf' })}
                  >
                    {state.etf ? 'Edit →' : 'Open →'}
                  </button>
                )}
              </div>

              {etfLocked ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>
                    <span>XP to unlock</span>
                    <span style={{ color: 'var(--gr)', fontWeight: 600 }}>{user.xp.toLocaleString()} / 1,500</span>
                  </div>
                  <div className="progress-bar" style={{ marginBottom: 12 }}>
                    <div className="progress-fill" style={{ width: `${(user.xp / ETF_XP_REQUIRED) * 100}%` }} />
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const, marginBottom: 12 }}>
                    {['📊 Diversification', '📈 vs S&P 500', '🏆 Compete'].map(tag => (
                      <span key={tag} style={{
                        fontSize: 10, padding: '3px 8px', borderRadius: 20,
                        background: 'var(--surface2)', color: 'var(--text3)',
                        border: '1px solid var(--border)',
                      }}>{tag}</span>
                    ))}
                  </div>
                  <button
                    className="btn btn-secondary"
                    style={{ width: '100%', opacity: 0.45, cursor: 'not-allowed', fontSize: 13 }}
                    disabled
                  >
                    🔒 Unlocks at 1,500 XP — {ETF_XP_REQUIRED - user.xp} XP away
                  </button>
                </div>
              ) : state.etf ? (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>"{state.etf.name}"</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                      {state.etf.ticker} · {state.etf.holdings.length} holdings
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
                    {[
                      { label: 'ETF Return', value: `+${etfReturn}%`, color: 'var(--gr)' },
                      { label: 'S&P 500', value: `+${SP500_YTD}%`, color: 'var(--gr)' },
                      { label: 'Alpha', value: `${etfAlpha >= 0 ? '+' : ''}${etfAlpha}%`, color: etfAlpha >= 0 ? 'var(--gr)' : 'var(--red)' },
                    ].map(m => (
                      <div key={m.label} style={{
                        background: 'var(--bg3)', borderRadius: 'var(--radius)',
                        padding: '8px 10px', border: '1px solid var(--border)',
                      }}>
                        <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 3 }}>{m.label}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: m.color, fontFamily: 'monospace' }}>{m.value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {state.etf.holdings.slice(0, 4).map((h, i) => {
                      const stock = STOCKS.find(s => s.sym === h.sym);
                      const color = ETF_COLORS[i % ETF_COLORS.length];
                      return (
                        <div key={h.sym}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 42, fontFamily: 'monospace' }}>{h.sym}</span>
                              {stock && <span style={{ fontSize: 10, color: 'var(--text3)' }}>{stock.name}</span>}
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 600, color, fontFamily: 'monospace' }}>{h.weight}%</span>
                          </div>
                          <div className="progress-bar" style={{ height: 4 }}>
                            <div className="progress-fill" style={{ width: `${h.weight}%`, background: color }} />
                          </div>
                        </div>
                      );
                    })}
                    {state.etf.holdings.length > 4 && (
                      <div style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center' as const }}>
                        +{state.etf.holdings.length - 4} more holdings
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 14 }}>
                    Build your own virtual ETF — set stock allocations, track performance vs the S&amp;P 500, and compete for review by institutional partners.
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const, marginBottom: 14 }}>
                    {[
                      { label: '📊 Diversification', bg: 'var(--gr-dim)', border: 'var(--gr)', color: 'var(--gr)' },
                      { label: '📈 vs S&P 500', bg: 'var(--blue-dim)', border: 'var(--blue)', color: 'var(--blue)' },
                      { label: '🏆 Compete', bg: 'rgba(249,199,79,0.12)', border: 'var(--yellow)', color: 'var(--yellow)' },
                    ].map(tag => (
                      <span key={tag.label} style={{
                        fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 500,
                        background: tag.bg, border: `1px solid ${tag.border}`, color: tag.color,
                      }}>{tag.label}</span>
                    ))}
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: 13 }}
                    onClick={() => dispatch({ type: 'SET_VIEW', view: 'etf' })}
                  >
                    🏦 Create Your ETF (+100 XP)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* XP Progress widget */}
          <div className="card">
            <div className="card-title">XP PROGRESS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--gr2), var(--gr))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 15, color: 'var(--bg)', flexShrink: 0,
              }}>
                L{levelNum}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Level {levelNum}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                  {user.xp.toLocaleString()} / {nextXP.toLocaleString()} XP
                </div>
              </div>
            </div>
            <div className="progress-bar" style={{ marginBottom: 16 }}>
              <div className="progress-fill" style={{ width: `${Math.min(xpProgress, 100)}%` }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {FEATURE_LIST.map(f => {
                const locked = isLocked(f.view, user.xp);
                return (
                  <div key={f.view} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: locked ? 'var(--text3)' : 'var(--text)' }}>{f.label}</span>
                    {locked ? (
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>🔒 Locked</span>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--gr)', fontWeight: 600 }}>✓ Unlocked</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leaderboard mini widget */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div className="card-title" style={{ margin: 0 }}>LEADERBOARD</div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => dispatch({ type: 'SET_VIEW', view: 'leaderboard' })}
              >
                Full →
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {LB.slice(0, 5).map((entry, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: i < 3 ? 'var(--gr-dim)' : 'var(--surface2)',
                    border: `1px solid ${i < 3 ? 'var(--gr)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700,
                    color: i < 3 ? 'var(--gr)' : 'var(--text2)',
                    flexShrink: 0,
                  }}>
                    {entry.rank}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {entry.name}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {entry.school}
                    </div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gr)', flexShrink: 0 }}>
                    +{(entry.returnPct ?? 0).toFixed(1)}%
                  </span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: 'var(--text2)', flexShrink: 0,
                }}>
                  {myRank}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.name}
                    </span>
                    <span className="badge badge-blue" style={{ fontSize: 9, padding: '1px 5px', flexShrink: 0 }}>YOU</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>—</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: myReturnPct >= 0 ? 'var(--gr)' : 'var(--red)', flexShrink: 0 }}>
                  {myReturnPct >= 0 ? '+' : ''}{myReturnPct.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Your Mentor widget */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div className="card-title" style={{ margin: 0 }}>YOUR MENTOR</div>
              <span className="badge badge-green">ASSIGNED</span>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'var(--surface2)', border: '2px solid var(--gr)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 15, color: 'var(--gr)', flexShrink: 0,
              }}>
                {mentorInitials}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{assignedMentor.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{assignedMentor.title}</div>
              </div>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', fontSize: 13 }}
              onClick={() => dispatch({ type: 'SET_VIEW', view: 'mentors' })}
            >
              📅 Book a Meeting
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
