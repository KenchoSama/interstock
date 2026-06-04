import { useApp } from '../state/AppContext';
import { SCHOOLS, STUDENTS } from '../data';

export default function PartnerDash() {
  const { dispatch } = useApp();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div className="page-header">
        <div>
          <div className="page-title">Partner Dashboard 🤝</div>
          <div className="page-subtitle">Goldman Sachs — Community Impact Partner</div>
        </div>
      </div>
      <div className="page-body">
        <div className="stats-row" style={{ marginBottom: 24 }}>
          {[
            { label: 'Schools Sponsored', value: '3', sub: 'Chicago, Detroit, Atlanta' },
            { label: 'Students Reached', value: STUDENTS.length.toString(), sub: 'Active learners' },
            { label: 'Mentors Placed', value: '2', sub: '1 more pending' },
            { label: 'Interns Hired', value: '1', sub: 'This semester' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid-2" style={{ gap: 20 }}>
          <div className="card">
            <div className="card-title">Sponsored Schools</div>
            {SCHOOLS.slice(0, 3).map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{s.city}, {s.state}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--gr)' }}>{s.active} active</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.students} enrolled</div>
                </div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-title">Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-primary" onClick={() => dispatch({ type: 'SET_VIEW', view: 'mentors' })}>
                👩‍🏫 Manage Mentors
              </button>
              <button className="btn btn-secondary" onClick={() => dispatch({ type: 'SET_VIEW', view: 'sponsorships' })}>
                💰 View Sponsorships
              </button>
              <button className="btn btn-secondary" onClick={() => dispatch({ type: 'SET_VIEW', view: 'support' })}>
                💬 Contact InterStock Team
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
