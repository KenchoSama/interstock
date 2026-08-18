import { useApp } from '../state/AppContext';
import { useFieldTrips } from '../hooks/useFieldTrips';
import { useProfileData } from '../hooks/useProfileData';
import { usePublicStudentProfile } from '../hooks/usePublicStudentProfile';
import { INTERNSHIP_DATA } from '../data/internships';
import { STOCKS } from '../data';

const LEVEL_THRESHOLDS = [0, 100, 200, 500, 1000, 1200, 1500, 2000, 2500, 3000];

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

function StatusPill({ label, earned }: { label: string; earned: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '1px 7px',
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        background: earned ? 'rgba(0,230,118,0.12)' : 'var(--surface2)',
        color: earned ? '#00e676' : 'var(--text3)',
      }}
    >
      {label}
    </span>
  );
}

function initialsOf(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function Profile() {
  const { state } = useApp();
  const viewedId = state.viewedProfileId;

  if (viewedId) {
    return <PublicProfile studentId={viewedId} />;
  }

  return <OwnProfile />;
}

// ────────────────────────────────────────────────────────────────────────
// Own profile — the logged-in student viewing themselves
// ────────────────────────────────────────────────────────────────────────
function OwnProfile() {
  const { state, dispatch } = useApp();
  const user = state.u[state.role];
  const xp = user.xp;

  const { trips } = useFieldTrips();
  const { loading, error, schoolName, globalRank, mentor, hasCompletedScenario, hasEtfSubmission, diplomas, recentTrades } =
    useProfileData();

  const initials = initialsOf(user.name);
  const levelNum = LEVEL_THRESHOLDS.filter(t => t <= xp).length;
  const pf101Diploma = diplomas.find(d => d.certType === 'PF101');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-body">
        {loading && (
          <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 13, padding: '40px 0' }}>
            Loading profile…
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign: 'center', color: 'var(--red)', fontSize: 13, padding: '40px 0' }}>
            Couldn't load some profile data. {error}
          </div>
        )}

        {!loading && (
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
                    {schoolName && (
                      <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{schoolName}</div>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(0,230,118,0.12)', color: '#00e676' }}>
                        Level {levelNum} Investor
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(0,230,118,0.12)', color: '#00e676' }}>
                        {xp.toLocaleString()} XP
                      </span>
                      {globalRank !== null && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'var(--blue-dim)', color: 'var(--blue)' }}>
                          Rank #{globalRank} Nationally
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
                  High school student investor{schoolName ? ` at ${schoolName}` : ''}. Passionate about capital markets, equity research, and financial technology. Aspiring finance professional with hands-on experience in portfolio management and quantitative analysis through InterStock.
                </div>
              </div>

              {/* Recent Trades */}
              <div className="card">
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 14 }}>
                  Recent Trades
                </div>
                {recentTrades.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {recentTrades.map(t => {
                      const isBuy = t.type.toLowerCase() === 'buy';
                      const date = new Date(t.executedAt);
                      const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      return (
                        <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '2px 8px',
                                borderRadius: 20,
                                fontSize: 10,
                                fontWeight: 700,
                                background: isBuy ? 'rgba(0,230,118,0.12)' : 'rgba(255,82,82,0.12)',
                                color: isBuy ? '#00e676' : 'var(--red)',
                              }}
                            >
                              {t.type.toUpperCase()}
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--yellow)', fontFamily: 'monospace' }}>
                              {t.ticker}
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                              {t.shares} sh @ ${t.price.toFixed(2)}
                            </span>
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text3)' }}>{dateLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>No trades yet.</div>
                )}
              </div>
            </div>

            {/* ── Sidebar ── */}
            <div>

              {/* Credentials & Unlocks */}
              <SidePanel title="Credentials &amp; Unlocks">
                {trips.map(trip => (
                  <RowDivider key={trip.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontSize: 11, color: 'var(--text)' }}>{trip.title}</span>
                    </div>
                    <StatusPill label={xp >= trip.xp_required ? 'ELIGIBLE' : 'LOCKED'} earned={xp >= trip.xp_required} />
                  </RowDivider>
                ))}

                {INTERNSHIP_DATA.map(intern => (
                  <RowDivider key={intern.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontSize: 11, color: 'var(--text)' }}>{intern.title}</span>
                    </div>
                    <StatusPill label={xp >= intern.xpReq ? 'ELIGIBLE' : 'LOCKED'} earned={xp >= intern.xpReq} />
                  </RowDivider>
                ))}

                <RowDivider>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 11, color: 'var(--text)' }}>
                      {mentor ? `Mentor: ${mentor.name}` : 'Mentor'}
                    </span>
                  </div>
                  <StatusPill label={mentor ? 'ACTIVE' : 'UNASSIGNED'} earned={!!mentor} />
                </RowDivider>

                <RowDivider>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 11, color: 'var(--text)' }}>Scenario Challenge</span>
                  </div>
                  <StatusPill label={hasCompletedScenario ? 'COMPLETED' : 'AVAILABLE'} earned={hasCompletedScenario} />
                </RowDivider>

                <RowDivider>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 11, color: 'var(--text)' }}>PF101 Diploma</span>
                  </div>
                  <StatusPill label={pf101Diploma ? 'EARNED' : 'AVAILABLE'} earned={!!pf101Diploma} />
                </RowDivider>

                <RowDivider>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 11, color: 'var(--text)' }}>ETF Builder</span>
                  </div>
                  <StatusPill label={hasEtfSubmission ? 'SUBMITTED' : 'AVAILABLE'} earned={hasEtfSubmission} />
                </RowDivider>
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
                  Share Profile Link
                </button>
                <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                  Download PDF Resume
                </button>
              </SidePanel>

              {/* My Diplomas */}
              <SidePanel title="My Diplomas">
                {diplomas.length > 0 ? (
                  diplomas.map(d => (
                    <RowDivider key={d.id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{d.certType}</span>
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
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Public profile — viewing another student, read-only
// ────────────────────────────────────────────────────────────────────────
function PublicProfile({ studentId }: { studentId: string }) {
  const { dispatch } = useApp();
  const {
    loading, error, name, xp, schoolName, globalRank, mentor,
    hasCompletedScenario, hasEtfSubmission, diplomas, recentTrades, holdings,
  } = usePublicStudentProfile(studentId);

  const { trips } = useFieldTrips();

  const levelNum = LEVEL_THRESHOLDS.filter(t => t <= xp).length;
  const pf101Diploma = diplomas.find(d => d.certType === 'PF101');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <button className="btn btn-secondary btn-sm" onClick={() => dispatch({ type: 'SET_VIEW', view: 'leaderboard' })}>
          ← Back
        </button>
      </div>

      <div className="page-body">
        {loading && (
          <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 13, padding: '40px 0' }}>
            Loading profile…
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign: 'center', color: 'var(--red)', fontSize: 13, padding: '40px 0' }}>
            Couldn't load this profile. {error}
          </div>
        )}

        {!loading && !error && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'start' }}>

            {/* ── Main column ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Hero card */}
              <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(0,230,118,0.04)', pointerEvents: 'none' }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gr2), #00e676)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'var(--bg)', flexShrink: 0 }}>
                    {initialsOf(name ?? 'Student')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{name}</div>
                    {schoolName && (
                      <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{schoolName}</div>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(0,230,118,0.12)', color: '#00e676' }}>
                        Level {levelNum} Investor
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(0,230,118,0.12)', color: '#00e676' }}>
                        {xp.toLocaleString()} XP
                      </span>
                      {globalRank !== null && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'var(--blue-dim)', color: 'var(--blue)' }}>
                          Rank #{globalRank} Nationally
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Trades */}
              <div className="card">
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 14 }}>
                  Recent Trades
                </div>
                {recentTrades.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {recentTrades.map(t => {
                      const isBuy = t.type.toLowerCase() === 'buy';
                      const date = new Date(t.executedAt);
                      const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      return (
                        <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '2px 8px',
                                borderRadius: 20,
                                fontSize: 10,
                                fontWeight: 700,
                                background: isBuy ? 'rgba(0,230,118,0.12)' : 'rgba(255,82,82,0.12)',
                                color: isBuy ? '#00e676' : 'var(--red)',
                              }}
                            >
                              {t.type.toUpperCase()}
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--yellow)', fontFamily: 'monospace' }}>
                              {t.ticker}
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                              {t.shares} sh @ ${t.price.toFixed(2)}
                            </span>
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text3)' }}>{dateLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>No trades yet.</div>
                )}
              </div>
            </div>

            {/* ── Sidebar ── */}
            <div>

              {/* Credentials & Unlocks */}
              <SidePanel title="Credentials &amp; Unlocks">
                {trips.map(trip => (
                  <RowDivider key={trip.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontSize: 11, color: 'var(--text)' }}>{trip.title}</span>
                    </div>
                    <StatusPill label={xp >= trip.xp_required ? 'ELIGIBLE' : 'LOCKED'} earned={xp >= trip.xp_required} />
                  </RowDivider>
                ))}

                {INTERNSHIP_DATA.map(intern => (
                  <RowDivider key={intern.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontSize: 11, color: 'var(--text)' }}>{intern.title}</span>
                    </div>
                    <StatusPill label={xp >= intern.xpReq ? 'ELIGIBLE' : 'LOCKED'} earned={xp >= intern.xpReq} />
                  </RowDivider>
                ))}

                <RowDivider>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 11, color: 'var(--text)' }}>
                      {mentor ? `Mentor: ${mentor.name}` : 'Mentor'}
                    </span>
                  </div>
                  <StatusPill label={mentor ? 'ACTIVE' : 'UNASSIGNED'} earned={!!mentor} />
                </RowDivider>

                <RowDivider>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 11, color: 'var(--text)' }}>Scenario Challenge</span>
                  </div>
                  <StatusPill label={hasCompletedScenario ? 'COMPLETED' : 'AVAILABLE'} earned={hasCompletedScenario} />
                </RowDivider>

                <RowDivider>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 11, color: 'var(--text)' }}>PF101 Diploma</span>
                  </div>
                  <StatusPill label={pf101Diploma ? 'EARNED' : 'AVAILABLE'} earned={!!pf101Diploma} />
                </RowDivider>

                <RowDivider>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 11, color: 'var(--text)' }}>ETF Builder</span>
                  </div>
                  <StatusPill label={hasEtfSubmission ? 'SUBMITTED' : 'AVAILABLE'} earned={hasEtfSubmission} />
                </RowDivider>
              </SidePanel>

              {/* Portfolio Summary */}
              <SidePanel title="Portfolio Summary">
                {holdings.length > 0 ? (
                  holdings.map(h => {
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
                  })
                ) : (
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>No holdings yet.</div>
                )}
              </SidePanel>

              {/* Diplomas */}
              <SidePanel title="Diplomas">
                {diplomas.length > 0 ? (
                  diplomas.map(d => (
                    <RowDivider key={d.id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{d.certType}</span>
                      </div>
                    </RowDivider>
                  ))
                ) : (
                  <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.6 }}>
                    No diplomas earned yet.
                  </div>
                )}
              </SidePanel>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
