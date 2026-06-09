import { useApp, getLevelName } from '../state/AppContext';
import { STOCKS } from '../data';

const LEVEL_THRESHOLDS = [0, 100, 200, 500, 1000, 1200, 1500, 2000, 2500, 3000];

const SKILLS = ['Stock Valuation', 'P/E Analysis', 'Paper Trading', 'Technical Analysis', 'Personal Finance', 'Budgeting', 'Credit Score Mgmt', 'ETF Construction'];

const SKILL_LEVELS: Record<string, number> = {
  'Stock Valuation': 82, 'P/E Analysis': 75, 'Paper Trading': 90,
  'Technical Analysis': 65, 'Personal Finance': 95, 'Budgeting': 88,
  'Credit Score Mgmt': 60, 'ETF Construction': 45,
};

const ACTIVITY = [
  { icon: '📚', action: 'Completed: Banking & Interest Rates', sub: '+40 XP · Yesterday' },
  { icon: '📈', action: 'Paper traded AAPL', sub: 'Bought 3 shares virtual · +25 XP · Yesterday' },
  { icon: '🏆', action: 'Moved to national rank #23', sub: 'Leaderboard · 2 days ago' },
  { icon: '🎯', action: 'Scenario Challenge: 6/8 correct', sub: '+60 XP · 3 days ago' },
  { icon: '🤝', action: 'Mentor assigned: Sarah Mitchell', sub: 'CIO, Foster Capital · 4 days ago' },
];

const CREDENTIALS = [
  { icon: '🏛', title: 'Partner Field Trip — Finance',   status: 'ELIGIBLE',   color: '#00e676',      bg: 'rgba(0,230,118,0.12)' },
  { icon: '📊', title: 'Partner Field Trip — Exchange',  status: 'ELIGIBLE',   color: '#00e676',      bg: 'rgba(0,230,118,0.12)' },
  { icon: '💼', title: 'Partner Internship',             status: 'ELIGIBLE',   color: '#00e676',      bg: 'rgba(0,230,118,0.12)' },
  { icon: '🤝', title: 'Mentor: Sarah Mitchell',         status: 'ACTIVE',     color: '#00e676',      bg: 'rgba(0,230,118,0.12)' },
  { icon: '🎯', title: 'Scenario Challenge',             status: 'UNLOCKED',   color: 'var(--yellow)', bg: 'rgba(249,199,79,0.12)' },
  { icon: '📜', title: 'PF101 Diploma',                  status: 'AVAILABLE',  color: 'var(--blue)',  bg: 'var(--blue-dim)' },
  { icon: '🏗️', title: 'ETF Builder',                   status: 'Need 2,150 XP', color: 'var(--text3)', bg: 'var(--surface2)' },
];

function SidePanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 12 }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
        {title}
      </div>
      <div style={{ padding: '10px 14px' }}>{children}</div>
    </div>
  );
}

function RowDivider({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
      {children}
    </div>
  );
}

export default function Profile() {
  const { state, dispatch } = useApp();
  const user = state.u[state.role];

  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const levelNum = LEVEL_THRESHOLDS.filter(t => t <= user.xp).length;

  const earnedDiplomas = user.diplomas.filter(d => d.earned);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'start' }}>

          {/* ── Main column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Hero card */}
            <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(0,230,118,0.04)', pointerEvents: 'none' }} />

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gr2), #00e676)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'var(--bg)', flexShrink: 0 }}>
                  {initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{user.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Lincoln High School · Grade 11 · United States</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                    {[
                      { label: `Level ${levelNum} Investor`, bg: 'rgba(0,230,118,0.12)', color: '#00e676' },
                      { label: `${user.xp.toLocaleString()} XP`, bg: 'rgba(0,230,118,0.12)', color: '#00e676' },
                      { label: 'Rank #23 Nationally', bg: 'var(--blue-dim)', color: 'var(--blue)' },
                      { label: 'LMI Community', bg: 'rgba(168,85,247,0.12)', color: '#a855f7' },
                      { label: 'Multi-State', bg: 'rgba(0,212,168,0.12)', color: 'var(--gr)' },
                      { label: 'Top 3%', bg: 'rgba(249,199,79,0.12)', color: 'var(--yellow)' },
                    ].map(b => (
                      <span key={b.label} style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: b.bg, color: b.color }}>
                        {b.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 14 }}>
                High school student investor at Lincoln High School. Passionate about capital markets, equity research, and financial technology. Aspiring finance professional with hands-on experience in portfolio management and quantitative analysis through InterStock.
              </div>

              <div style={{ height: 1, background: 'var(--border)', marginBottom: 12 }} />

              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Skills &amp; Competencies</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {SKILLS.slice(0, 8).map(s => (
                  <span key={s} style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text2)' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Skill Progress */}
            <div className="card">
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 14 }}>Skill Progress</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {SKILLS.slice(0, 6).map(s => {
                  const pct = SKILL_LEVELS[s] ?? 0;
                  const barColor = pct >= 80 ? '#00e676' : pct >= 60 ? 'var(--gr)' : 'var(--yellow)';
                  return (
                    <div key={s}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: 'var(--text)' }}>{s}</span>
                        <span style={{ color: barColor, fontFamily: 'monospace', fontSize: 11 }}>{pct}%</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 3 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Performance Stats */}
            <div className="card">
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 14 }}>Performance Stats</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                {[
                  { label: 'Quiz Average', value: '90%', color: '#00e676' },
                  { label: 'Program Hours', value: '38 hrs', color: 'var(--text)' },
                  { label: 'Lessons Done', value: '4/20', color: 'var(--text)' },
                ].map(m => (
                  <div key={m.label} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{m.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'monospace', color: m.color }}>{m.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Financial Literacy Score Journey</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'monospace', marginBottom: 2 }}>PRE-PROGRAM</div>
                  <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'monospace', color: 'var(--yellow)' }}>42</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 6, background: 'linear-gradient(90deg, var(--yellow), #00e676)', borderRadius: 3 }} />
                  <div style={{ textAlign: 'center', marginTop: 6 }}>
                    <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(0,230,118,0.12)', color: '#00e676' }}>
                      +36 points · +86% improvement
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'monospace', marginBottom: 2 }}>CURRENT</div>
                  <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'monospace', color: '#00e676' }}>78</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 14 }}>Recent Activity</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ACTIVITY.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>
                      {a.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{a.action}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{a.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div>

            {/* Credentials & Unlocks */}
            <SidePanel title="Credentials &amp; Unlocks">
              {CREDENTIALS.map((c, i) => (
                <RowDivider key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 13 }}>{c.icon}</span>
                    <span style={{ fontSize: 11, color: 'var(--text)' }}>{c.title}</span>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '1px 7px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: c.bg, color: c.color, whiteSpace: 'nowrap' }}>
                    {c.status}
                  </span>
                </RowDivider>
              ))}
            </SidePanel>

            {/* Portfolio Summary */}
            <SidePanel title="Portfolio Summary">
              {user.portfolio.map(h => {
                const stock = STOCKS.find(s => s.sym === h.sym);
                const price = stock?.price ?? h.avg;
                const retPct = ((price - h.avg) / h.avg) * 100;
                const pos = retPct >= 0;
                return (
                  <RowDivider key={h.sym}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--yellow)', fontFamily: 'monospace' }}>{h.sym}</span>
                      <span style={{ fontSize: 10, color: 'var(--text3)' }}>{h.shares} shares</span>
                    </div>
                    <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 600, color: pos ? '#00e676' : 'var(--red)' }}>
                      {pos ? '+' : ''}{retPct.toFixed(1)}%
                    </span>
                  </RowDivider>
                );
              })}
            </SidePanel>

            {/* Share Profile */}
            <SidePanel title="Share Profile">
              <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 10 }}>
                Share with colleges, internship programs, and financial firms to showcase your education and performance.
              </div>
              <button className="btn btn-primary btn-sm" style={{ width: '100%', marginBottom: 6, background: 'linear-gradient(90deg, var(--gr2), #00e676)', color: 'var(--bg)' }}>
                🔗 Share Profile Link
              </button>
              <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                📄 Download PDF Resume
              </button>
            </SidePanel>

            {/* My Diplomas */}
            <SidePanel title="My Diplomas">
              {earnedDiplomas.length > 0 ? (
                earnedDiplomas.map(d => (
                  <RowDivider key={d.courseId}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>🎓</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{d.courseName}</span>
                    </div>
                    <button className="btn btn-secondary btn-sm" style={{ padding: '2px 8px', fontSize: 10 }}>
                      PDF
                    </button>
                  </RowDivider>
                ))
              ) : (
                <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.6 }}>
                  Pass a diploma exam to earn certificates!{' '}
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', padding: '2px 8px', fontSize: 10, marginTop: 6 }}
                    onClick={() => dispatch({ type: 'SET_VIEW', view: 'diplomas' })}
                  >
                    Go to Diplomas
                  </button>
                </div>
              )}
            </SidePanel>

          </div>
        </div>
      </div>
    </div>
  );
}
