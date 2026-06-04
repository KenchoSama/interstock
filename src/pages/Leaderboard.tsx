import { useApp, getLevelName } from '../state/AppContext';
import { LB } from '../data';

export default function Leaderboard() {
  const { state } = useApp();
  const myXp = state.u[state.role].xp;
  const myName = state.u[state.role].name;

  const myRank = LB.findIndex(e => e.xp < myXp) + 1 || LB.length + 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Leaderboard 📋</div>
          <div className="page-subtitle">Top students ranked by XP earned</div>
        </div>
      </div>
      <div className="page-body">
        <div className="stats-row" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-label">Your Rank</div>
            <div className="stat-value">#{myRank}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Your XP</div>
            <div className="stat-value" style={{ color: 'var(--gr)' }}>{myXp.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Your Level</div>
            <div className="stat-value" style={{ fontSize: 16 }}>{getLevelName(myXp)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Students</div>
            <div className="stat-value">{LB.length + 1}</div>
          </div>
        </div>

        <div className="card">
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student</th>
                <th>School</th>
                <th>Level</th>
                <th style={{ textAlign: 'right' }}>XP</th>
              </tr>
            </thead>
            <tbody>
              {LB.map((entry, i) => (
                <tr key={i} style={{ fontWeight: i < 3 ? 600 : undefined }}>
                  <td>
                    <span style={{ fontSize: 18 }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${entry.rank}`}
                    </span>
                  </td>
                  <td>{entry.name}</td>
                  <td style={{ color: 'var(--text2)', fontSize: 12 }}>{entry.school}</td>
                  <td>
                    <span className="badge badge-green">{entry.level}</span>
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--gr)', fontWeight: 600 }}>
                    {entry.xp.toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr style={{ background: 'var(--gr-dim)', fontWeight: 600 }}>
                <td>#{myRank}</td>
                <td>{myName} (You)</td>
                <td style={{ fontSize: 12, color: 'var(--text2)' }}>—</td>
                <td><span className="badge badge-blue">{getLevelName(myXp)}</span></td>
                <td style={{ textAlign: 'right', color: 'var(--gr)' }}>{myXp.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
