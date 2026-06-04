import { STUDENTS } from '../data';

export default function SchoolPerf() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Performance Report 📊</div>
          <div className="page-subtitle">Lincoln High School — Class of 2026</div>
        </div>
      </div>
      <div className="page-body">
        <div className="stats-row" style={{ marginBottom: 24 }}>
          {[
            { label: 'Avg Lesson Completion', value: '74%', sub: '+8% from last month', up: true },
            { label: 'Avg Game Score', value: '8.4 / 15', sub: 'Top quartile nationally', up: true },
            { label: 'Diplomas This Month', value: '2', sub: '1 more pending', up: false },
            { label: 'At-Risk Students', value: '1', sub: 'Below 500 XP', up: false },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className={`stat-sub ${s.up ? 'up' : ''}`}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="section-title">Individual Progress</div>
        <div className="card">
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Student</th>
                <th>XP</th>
                <th>Level</th>
                <th>Progress</th>
                <th>Diplomas</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {STUDENTS.map(s => (
                <tr key={s.id}>
                  <td>{s.name} <span style={{ fontSize: 11, color: 'var(--text3)' }}>{s.grade}</span></td>
                  <td style={{ color: 'var(--gr)', fontWeight: 600 }}>{s.xp.toLocaleString()}</td>
                  <td>{s.level}</td>
                  <td style={{ width: 120 }}>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${s.progress}%` }} />
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{s.progress}%</div>
                  </td>
                  <td>—</td>
                  <td>
                    <span className={`badge ${s.xp >= 1000 ? 'badge-green' : s.xp >= 300 ? 'badge-yellow' : 'badge-red'}`}>
                      {s.xp >= 1000 ? 'On Track' : s.xp >= 300 ? 'Progressing' : 'At Risk'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
