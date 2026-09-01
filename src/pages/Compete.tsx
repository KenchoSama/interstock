import { useState } from 'react';
import { useApp } from '../state/AppContext';
import { useCompetitions } from '../hooks/useCompetitions';
import { usePartners } from '../hooks/usePartners';
import { useTournamentLeaderboard } from '../hooks/useTournamentLeaderboard';

function TournamentLeaderboardCard({ competitionId, competitionName, mySchoolId }: {
  competitionId: string;
  competitionName: string;
  mySchoolId: string | null;
}) {
  const { students, schools, loading, error } = useTournamentLeaderboard(competitionId);
  const [view, setView] = useState<'students' | 'schools'>('students');

  return (
    <div className="card" style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{competitionName} — Standings</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['students', 'schools'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '3px 10px', fontSize: 11, borderRadius: 6,
                background: view === v ? 'var(--gr)' : 'var(--surface)',
                color: view === v ? '#000' : 'var(--text2)',
                fontWeight: view === v ? 700 : 400,
              }}
            >
              {v === 'students' ? 'Individual' : 'School Teams'}
            </button>
          ))}
        </div>
      </div>

      {loading && <div style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', padding: '20px 0' }}>Loading standings...</div>}
      {!loading && error && <div style={{ fontSize: 13, color: 'var(--red)', textAlign: 'center', padding: '20px 0' }}>Couldn't load standings. {error}</div>}

      {!loading && !error && view === 'students' && (
        <div className="table-wrap">
          <table style={{ width: '100%' }}>
            <thead>
              <tr><th>Rank</th><th>Student</th><th>School</th><th>Return</th></tr>
            </thead>
            <tbody>
              {students.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: 'var(--text3)', fontSize: 13 }}>No entries yet.</td></tr>
              )}
              {students.map(s => (
                <tr key={s.userId} style={s.schoolId === mySchoolId ? { background: 'rgba(0,230,118,0.08)' } : undefined}>
                  <td style={{ fontFamily: 'monospace' }}>#{s.rank}</td>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td style={{ color: 'var(--text3)', fontSize: 12 }}>{s.schoolName}</td>
                  <td style={{ color: s.returnPct >= 0 ? '#00e676' : 'var(--red)', fontFamily: 'monospace', fontWeight: 600 }}>
                    {s.returnPct >= 0 ? '+' : ''}{s.returnPct.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && view === 'schools' && (
        <div className="table-wrap">
          <table style={{ width: '100%' }}>
            <thead>
              <tr><th>Rank</th><th>School</th><th>Students</th><th>Avg Return</th></tr>
            </thead>
            <tbody>
              {schools.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: 'var(--text3)', fontSize: 13 }}>No entries yet.</td></tr>
              )}
              {schools.map(s => (
                <tr key={s.schoolId} style={s.schoolId === mySchoolId ? { background: 'rgba(0,230,118,0.08)' } : undefined}>
                  <td style={{ fontFamily: 'monospace' }}>#{s.rank}</td>
                  <td style={{ fontWeight: 600 }}>{s.schoolName}</td>
                  <td style={{ color: 'var(--text3)', fontSize: 12 }}>{s.studentCount}</td>
                  <td style={{ color: s.avgReturnPct >= 0 ? '#00e676' : 'var(--red)', fontFamily: 'monospace', fontWeight: 600 }}>
                    {s.avgReturnPct >= 0 ? '+' : ''}{s.avgReturnPct.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function Compete() {
  const { state } = useApp();
  const user = state.u[state.role];
  const { competitions, loading } = useCompetitions(user.supabaseId);
  const { partners, loading: partnersLoading } = usePartners();
  const [openLeaderboardId, setOpenLeaderboardId] = useState<string | null>(null);

  const active = competitions.filter(c => c.status === 'active');
  const upcoming = competitions.filter(c => c.status === 'upcoming');

  function isEntered(competitionId: string) {
    return user.tournamentPortfolios.some(tp => tp.competitionId === competitionId);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Compete 🏆</div>
          <div className="page-subtitle">Tournaments and competitions with schools nationwide</div>
        </div>
      </div>

      <div className="page-body">

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', fontSize: 13, color: 'var(--text3)' }}>
            Loading competitions...
          </div>
        )}

        {!loading && (
          <>
            {/* Active competitions */}
            <div className="section-title">Active Tournaments</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {active.length === 0 && (
                <div style={{ fontSize: 13, color: 'var(--text3)' }}>No active tournaments right now.</div>
              )}
              {active.map(comp => {
                const entered = isEntered(comp.id);
                return (
                  <div key={comp.id}>
                    <div className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{comp.name}</div>
                          <div style={{ display: 'flex', gap: 12, fontSize: 12, flexWrap: 'wrap' }}>
                            <span className="badge badge-blue">{comp.type}</span>
                            {comp.prize && <span style={{ color: 'var(--yellow)' }}>🏆 {comp.prize}</span>}
                            {comp.deadline && (
                              <span style={{ color: 'var(--text3)' }}>
                                📅 Ends: {new Date(comp.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            )}
                            <span style={{ color: 'var(--text3)' }}>👥 {comp.participants} entered</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          {entered ? (
                            <span className="badge badge-green">✓ Entered</span>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--text3)' }} title="Entry is opened by your school admin, not individually">
                              Ask your school to enter
                            </span>
                          )}
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setOpenLeaderboardId(openLeaderboardId === comp.id ? null : comp.id)}
                          >
                            {openLeaderboardId === comp.id ? 'Hide Standings' : 'View Standings'}
                          </button>
                        </div>
                      </div>
                    </div>
                    {openLeaderboardId === comp.id && (
                      <TournamentLeaderboardCard competitionId={comp.id} competitionName={comp.name} mySchoolId={user.school_id} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Upcoming competitions */}
            {upcoming.length > 0 && (
              <>
                <div className="section-title">Upcoming Tournaments</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                  {upcoming.map(comp => (
                    <div key={comp.id} className="card" style={{ opacity: 0.75 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{comp.name}</div>
                          <div style={{ display: 'flex', gap: 12, fontSize: 12, flexWrap: 'wrap' }}>
                            <span className="badge badge-yellow">UPCOMING</span>
                            {comp.prize && <span style={{ color: 'var(--yellow)' }}>🏆 {comp.prize}</span>}
                            {comp.deadline && (
                              <span style={{ color: 'var(--text3)' }}>
                                📅 Opens: {new Date(comp.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Partner Companies */}
            <div className="section-title">Partner Companies Sponsoring</div>
            {partnersLoading && (
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>Loading partners...</div>
            )}
            <div className="grid-3">
              {partners.map(p => (
                <div key={p.id} className="card">
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>{p.type}</div>
                  {p.contact && (
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>
                      Contact: {p.contact}
                    </div>
                  )}
                  <span className={`badge ${p.status === 'Active' ? 'badge-green' : 'badge-yellow'}`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
