import { useApp } from '../state/AppContext';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useFriends } from '../hooks/useFriends';

export default function Leaderboard() {
  const { state } = useApp();
  const user = state.u[state.role];
  const { entries, myEntry, loading, leader } = useLeaderboard(user.supabaseId ?? undefined, 20);
  const { sendRequest, sentIds } = useFriends(user.supabaseId);

  const isInTop = myEntry ? entries.some(e => e.id === myEntry.id) : false;

  function rankBadge(r: number) {
    const base: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 26,
      height: 26,
      borderRadius: 6,
      fontWeight: 700,
      fontSize: 13,
    };
    if (r === 1) return { ...base, background: 'rgba(249,199,79,0.2)', color: 'var(--yellow)' };
    if (r === 2) return { ...base, background: 'rgba(180,180,200,0.15)', color: '#b0b8c8' };
    if (r === 3) return { ...base, background: 'rgba(205,127,50,0.15)', color: '#cd7f32' };
    return { ...base, background: 'var(--surface2)', color: 'var(--text3)' };
  }

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { maximumFractionDigits: 0 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Leaderboard</div>
          <div className="page-subtitle">National Spring Stock Challenge</div>
        </div>
      </div>

      <div className="page-body">
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', fontSize: 13, color: 'var(--text3)' }}>
            Loading leaderboard...
          </div>
        )}

        {!loading && (
          <>
            {/* Stat cards */}
            <div className="stats-row" style={{ marginBottom: 20 }}>
              <div className="stat-card" style={{ borderLeft: '3px solid #00e676' }}>
                <div className="stat-label">Your Rank</div>
                <div className="stat-value">{myEntry ? `#${myEntry.global_rank}` : '—'}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Your Return</div>
                <div
                  className="stat-value"
                  style={{ color: (myEntry?.return_pct ?? 0) >= 0 ? '#00e676' : 'var(--red)' }}
                >
                  {myEntry ? `${myEntry.return_pct >= 0 ? '+' : ''}${myEntry.return_pct.toFixed(1)}%` : '—'}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Leader</div>
                <div className="stat-value" style={{ color: '#00e676' }}>
                  {leader ? `+${leader.return_pct.toFixed(1)}%` : '—'}
                </div>
                <div className="stat-sub">{leader?.full_name ?? '—'}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Participants</div>
                <div className="stat-value">{entries.length}</div>
              </div>
            </div>

            {/* Rankings table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div
                style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--border)',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--text2)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                }}
              >
                Full Rankings — National Spring Stock Challenge
              </div>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Student</th>
                    <th>School</th>
                    <th>Return</th>
                    <th>Value</th>
                    <th>Add</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>
                        No leaderboard data yet.
                      </td>
                    </tr>
                  )}

                  {entries.map(e => (
                    <tr key={e.id} style={e.id === myEntry?.id ? { background: 'rgba(0,230,118,0.08)' } : undefined}>
                      <td>
                        <div style={rankBadge(e.global_rank)}>{e.global_rank}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {e.full_name}
                        {e.id === myEntry?.id && (
                          <span
                            style={{ marginLeft: 6, fontSize: 10, padding: '1px 6px', display: 'inline-flex', alignItems: 'center', borderRadius: 20, fontWeight: 600, background: 'rgba(0,230,118,0.12)', color: '#00e676' }}
                          >
                            YOU
                          </span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text3)', fontSize: 12 }}>{e.school_id ?? '—'}</td>
                      <td style={{ color: e.return_pct >= 0 ? '#00e676' : 'var(--red)', fontFamily: 'monospace', fontWeight: 600 }}>
                        {e.return_pct >= 0 ? '+' : ''}{e.return_pct.toFixed(1)}%
                      </td>
                      <td style={{ fontFamily: 'monospace' }}>${fmt(e.total_value)}</td>
                      <td>
                        {e.id !== user.supabaseId && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => sendRequest(e.id)}
                            disabled={sentIds.has(e.id)}
                            style={{ fontSize: 11, opacity: sentIds.has(e.id) ? 0.6 : 1 }}
                          >
                            {sentIds.has(e.id) ? '✓ Requested' : '+ Add'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {/* Current user, shown separately if outside the fetched range */}
                  {myEntry && !isInTop && (
                    <>
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 11, padding: 10, fontFamily: 'monospace' }}>
                          ···
                        </td>
                      </tr>
                      <tr style={{ background: 'rgba(0,230,118,0.08)' }}>
                        <td>
                          <div style={rankBadge(myEntry.global_rank)}>{myEntry.global_rank}</div>
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {myEntry.full_name}
                          <span
                            style={{ marginLeft: 6, fontSize: 10, padding: '1px 6px', display: 'inline-flex', alignItems: 'center', borderRadius: 20, fontWeight: 600, background: 'rgba(0,230,118,0.12)', color: '#00e676' }}
                          >
                            YOU
                          </span>
                        </td>
                        <td style={{ color: 'var(--text3)', fontSize: 12 }}>{myEntry.school_id ?? '—'}</td>
                        <td style={{ color: myEntry.return_pct >= 0 ? '#00e676' : 'var(--red)', fontFamily: 'monospace', fontWeight: 600 }}>
                          {myEntry.return_pct >= 0 ? '+' : ''}{myEntry.return_pct.toFixed(1)}%
                        </td>
                        <td style={{ fontFamily: 'monospace' }}>${fmt(myEntry.total_value)}</td>
                        <td />
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
