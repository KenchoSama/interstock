import { useApp } from '../state/AppContext';
import { SCHOOLS, STUDENTS } from '../data';

export default function AdminDash() {
  const { dispatch } = useApp();

  const totalStudents = SCHOOLS.reduce((s, sch) => s + sch.students, 0);
  const totalActive = SCHOOLS.reduce((s, sch) => s + sch.active, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div className="page-header">
        <div>
          <div className="page-title">Admin Dashboard ⚙️</div>
          <div className="page-subtitle">InterStock Platform — System Overview</div>
        </div>
      </div>
      <div className="page-body">
        <div className="stats-row" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total Schools', value: SCHOOLS.length.toString(), sub: 'Across 6 cities' },
            { label: 'Total Students', value: totalStudents.toString(), sub: `${totalActive} active` },
            { label: 'Diplomas Issued', value: '47', sub: '+12 this month' },
            { label: 'CRA Partners', value: '3', sub: 'All active' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="section-title">School Network</div>
        <div className="card" style={{ marginBottom: 20 }}>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>School</th>
                <th>Location</th>
                <th>Students</th>
                <th>Active</th>
                <th>Engagement</th>
              </tr>
            </thead>
            <tbody>
              {SCHOOLS.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td style={{ color: 'var(--text2)' }}>{s.city}, {s.state}</td>
                  <td>{s.students}</td>
                  <td style={{ color: 'var(--gr)' }}>{s.active}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="progress-bar" style={{ width: 80 }}>
                        <div className="progress-fill" style={{ width: `${Math.round((s.active / s.students) * 100)}%` }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>{Math.round((s.active / s.students) * 100)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid-2" style={{ gap: 20 }}>
          <div className="card">
            <div className="card-title">Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-primary" onClick={() => dispatch({ type: 'SET_VIEW', view: 'cra' })}>
                📋 Generate CRA Report
              </button>
              <button className="btn btn-secondary">📧 Send Announcement to All Schools</button>
              <button className="btn btn-secondary">👥 Manage School Admins</button>
              <button className="btn btn-secondary">📊 Export Student Data</button>
            </div>
          </div>
          <div className="card">
            <div className="card-title">System Health</div>
            {[
              { label: 'Platform Uptime', value: '99.97%', status: 'green' },
              { label: 'API Response', value: '142ms avg', status: 'green' },
              { label: 'Active Sessions', value: '38', status: 'green' },
              { label: 'Pending Support Tickets', value: '4', status: 'yellow' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span style={{ color: 'var(--text2)' }}>{s.label}</span>
                <span className={`badge badge-${s.status}`}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
