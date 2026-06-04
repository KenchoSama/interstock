import { useApp } from '../state/AppContext';
import { STUDENTS } from '../data';

export default function SchoolDash() {
  const { dispatch } = useApp();

  const avgXp = Math.round(STUDENTS.reduce((s, st) => s + st.xp, 0) / STUDENTS.length);
  const topStudent = STUDENTS.sort((a, b) => b.xp - a.xp)[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <div>
          <div className="page-title">School Dashboard 🏫</div>
          <div className="page-subtitle">Lincoln High School — Spring 2026</div>
        </div>
      </div>
      <div className="page-body">
        <div className="stats-row" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-label">Total Students</div>
            <div className="stat-value">{STUDENTS.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active This Week</div>
            <div className="stat-value">6</div>
            <div className="stat-sub up">+2 from last week</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg XP</div>
            <div className="stat-value">{avgXp.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Diplomas Issued</div>
            <div className="stat-value">4</div>
          </div>
        </div>

        <div className="grid-2" style={{ gap: 20 }}>
          <div className="card">
            <div className="card-title">Student Roster</div>
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Grade</th>
                  <th>Level</th>
                  <th style={{ textAlign: 'right' }}>XP</th>
                </tr>
              </thead>
              <tbody>
                {STUDENTS.map(s => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td style={{ color: 'var(--text2)' }}>{s.grade}</td>
                    <td><span className="badge badge-green" style={{ fontSize: 10 }}>{s.level}</span></td>
                    <td style={{ textAlign: 'right', color: 'var(--gr)', fontWeight: 600 }}>{s.xp.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-title">Top Performer</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{topStudent.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>{topStudent.level}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--gr)' }}>{topStudent.xp.toLocaleString()} XP</div>
            </div>
            <div className="card">
              <div className="card-title">Quick Actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="btn btn-secondary" onClick={() => dispatch({ type: 'SET_VIEW', view: 'assignments' })}>
                  📝 Create Assignment
                </button>
                <button className="btn btn-secondary" onClick={() => dispatch({ type: 'SET_VIEW', view: 'school-perf' })}>
                  📊 View Performance Report
                </button>
                <button className="btn btn-secondary" onClick={() => dispatch({ type: 'SET_VIEW', view: 'support' })}>
                  💬 Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
