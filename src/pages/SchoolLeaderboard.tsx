import { useApp } from '../state/AppContext';
import { useSchoolLeaderboard } from '../hooks/useSchoolLeaderboard';

export default function SchoolLeaderboard() {
  const { state } = useApp();
  const user = state.u[state.role];
  const { entries, myEntry, loading, error } = useSchoolLeaderboard(user.school_id);

  function rankBadge(r: number): React.CSSProperties {
    const base: React.CSSProperties = {
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 26, height: 26, borderRadius: 6, fontWeight: 700, fontSize: 13,
    };
    if (r === 1) return { ...base, background: 'rgba(249,199,79,0.2)', color: 'var(--yellow)' };
    if (r === 2) return { ...base, background: 'rgba(180,180,200,0.15)', color: '#b0b8c8' };
    if (r === 3) return { ...base, background: 'rgba(205,127,50,0.15)', color: '#cd7f32' };
    return { ...base, background: 'var(--surface2)', color: 'var(--text3)' };
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <div>
          <div className="page-title">School Rankings</div>
          <div className="page-subtitle">Schools ranked by average student portfolio return</div>
        </div>
      </div>

      <div className="page-body">
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', fontSize: 13, color: 'var(--text3)' }}>
            Loading school rankings...
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign: 'center', padding: '40px 0', fontSize: 13, color: 'var(--red)' }}>
            Couldn't load school rankings. {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Stat cards */}
            <div className="stats-row" style={{ marginBottom: 20 }}>
              <div className="stat-card" style={{ borderLeft: '3px solid #00e676' }}>
                <div className="stat-label">Your School's Rank</div>
                <div className="stat-value">{myEntry ? `#${myEntry.rank}` : '—'}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Your School's Avg Return</div>
                <div className="stat-value" style={{ color: (myEntry?.avgReturnPct ?? 0) >= 0 ? '#00e676' : 'var(--red)' }}>
                  {myEntry ? `${myEntry.avgReturnPct >= 0 ? '+' : ''}${myEntry.avgReturnPct.toFixed(2)}%` : '—'}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Top School</div>
                <div className="stat-value" style={{ color: '#00e676' }}>
                  {entries[0] ? `+${entries[0].avgReturnPct.toFixed(2)}%` : '—'}
                </div>
                <div className="stat-sub">{entries[0]?.schoolName ?? '—'}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Schools</div>
                <div className="stat-value">{entries.length}</div>
              </div>
            </div>

            {/* Rankings table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Full Rankings
              </div>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>School</th>
                    <th>Students</th>
                    <th>Avg Return</th>
                    <th>Avg XP</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>
                        No school leaderboard data yet.
                      </td>
                    </tr>
                  )}

                  {entries.map(s => (
                    <tr key={s.schoolId} style={s.schoolId === user.school_id ? { background: 'rgba(0,230,118,0.08)' } : undefined}>
                      <td>
                        <div style={rankBadge(s.rank)}>{s.rank}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {s.schoolName}
                        {s.schoolId === user.school_id && (
                          <span style={{ marginLeft: 6, fontSize: 10, padding: '1px 6px', display: 'inline-flex', alignItems: 'center', borderRadius: 20, fontWeight: 600, background: 'rgba(0,230,118,0.12)', color: '#00e676' }}>
                            YOUR SCHOOL
                          </span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text3)', fontSize: 12 }}>{s.studentCount}</td>
                      <td style={{ color: s.avgReturnPct >= 0 ? '#00e676' : 'var(--red)', fontFamily: 'monospace', fontWeight: 600 }}>
                        {s.avgReturnPct >= 0 ? '+' : ''}{s.avgReturnPct.toFixed(2)}%
                      </td>
                      <td style={{ fontFamily: 'monospace' }}>{Math.round(s.avgXp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
