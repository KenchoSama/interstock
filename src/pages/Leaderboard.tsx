import { useApp } from '../state/AppContext';
import { LB } from '../data';

const MOVES: number[] = [0, 1, -1, 2, 0, 3, -2];

export default function Leaderboard() {
  const { state } = useApp();
  const user = state.u[state.role];
  const myReturn = user.portfolio.length > 0
    ? parseFloat(
        (
          user.portfolio.reduce((sum, h) => {
            const price = h.price;
            return sum + (price - h.avg) * h.shares;
          }, 0) /
          user.portfolio.reduce((sum, h) => sum + h.avg * h.shares, 0) *
          100
        ).toFixed(1)
      )
    : 6.8;

  const myRank =
    LB.findIndex(e => (e.returnPct ?? 0) < myReturn) + 1 || LB.length + 1;

  const leader = LB[0];
  const totalParticipants = 847;

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
        {/* Stat cards */}
        <div className="stats-row" style={{ marginBottom: 20 }}>
          <div className="stat-card" style={{ borderLeft: '3px solid #00e676' }}>
            <div className="stat-label">Your Rank</div>
            <div className="stat-value">#{myRank}</div>
            <div className="stat-sub" style={{ color: '#00e676' }}>Top 3%</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Your Return</div>
            <div className="stat-value" style={{ color: '#00e676' }}>+{myReturn}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Leader</div>
            <div className="stat-value" style={{ color: '#00e676' }}>+{leader.returnPct}%</div>
            <div className="stat-sub">{leader.name}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Participants</div>
            <div className="stat-value">{totalParticipants}</div>
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
                <th>Move</th>
              </tr>
            </thead>
            <tbody>
              {LB.map((e, i) => (
                <tr key={e.rank}>
                  <td>
                    <div style={rankBadge(e.rank)}>{e.rank}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {e.name}
                  </td>
                  <td style={{ color: 'var(--text3)', fontSize: 12 }}>{e.school}</td>
                  <td style={{ color: '#00e676', fontFamily: 'monospace', fontWeight: 600 }}>
                    +{e.returnPct}%
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>
                    ${fmt(100000 * (1 + (e.returnPct ?? 0) / 100))}
                  </td>
                  <td>
                    {MOVES[i] > 0 ? (
                      <span style={{ color: '#00e676' }}>▲{MOVES[i]}</span>
                    ) : MOVES[i] < 0 ? (
                      <span style={{ color: 'var(--red)' }}>▼{Math.abs(MOVES[i])}</span>
                    ) : (
                      <span style={{ color: 'var(--text3)' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}

              {/* Current user row */}
              <tr style={{ background: 'rgba(0,230,118,0.08)' }}>
                <td>
                  <div style={rankBadge(myRank)}>{myRank}</div>
                </td>
                <td style={{ fontWeight: 600 }}>
                  {user.name}
                  <span
                    style={{ marginLeft: 6, fontSize: 10, padding: '1px 6px', display: 'inline-flex', alignItems: 'center', borderRadius: 20, fontWeight: 600, background: 'rgba(0,230,118,0.12)', color: '#00e676' }}
                  >
                    YOU
                  </span>
                </td>
                <td style={{ color: 'var(--text3)', fontSize: 12 }}>Lincoln HS</td>
                <td style={{ color: '#00e676', fontFamily: 'monospace', fontWeight: 600 }}>
                  +{myReturn}%
                </td>
                <td style={{ fontFamily: 'monospace' }}>
                  ${fmt(100000 * (1 + myReturn / 100))}
                </td>
                <td>
                  <span style={{ color: '#00e676' }}>▲2</span>
                </td>
              </tr>

              {/* Ellipsis row */}
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: 'center',
                    color: 'var(--text3)',
                    fontSize: 11,
                    padding: 14,
                    fontFamily: 'monospace',
                  }}
                >
                  ··· {totalParticipants - LB.length - 1} more students ···
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
