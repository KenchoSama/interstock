function lmiBadgeStyle(lmi: number) {
  if (lmi >= 60) return { background: 'rgba(0,230,118,0.12)', color: '#00e676' };
  if (lmi >= 40) return { background: 'rgba(249,199,79,0.12)', color: 'var(--yellow)' };
  return { background: 'var(--surface2)', color: 'var(--text3)' };
}

const SCHOOLS_DATA = [
  { name: 'Lincoln High School',  zip: '—', students: 124, active: 112, lmi: 68, comp: 52, qa: 83, since: 'Sep 2023' },
  { name: 'Westlake HS',          zip: '—', students:  98, active:  91, lmi: 45, comp: 61, qa: 87, since: 'Jan 2024' },
  { name: 'Riverside HS',         zip: '—', students:  87, active:  79, lmi: 62, comp: 48, qa: 81, since: 'Jan 2024' },
  { name: 'St. Joseph Academy',   zip: '—', students:  76, active:  74, lmi: 38, comp: 71, qa: 91, since: 'Sep 2023' },
  { name: 'Horizon Academy',      zip: '—', students:  63, active:  55, lmi: 70, comp: 44, qa: 79, since: 'Mar 2024' },
  { name: 'Summit Prep',          zip: '—', students:  45, active:  40, lmi: 29, comp: 58, qa: 85, since: 'Sep 2024' },
];

const totalStudents = SCHOOLS_DATA.reduce((s, r) => s + r.students, 0);

export default function AdminDash() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-body">

        {/* Stat cards */}
        <div className="stats-row" style={{ marginBottom: 20 }}>
          <div className="stat-card" style={{ borderLeft: '3px solid #00e676' }}>
            <div className="stat-label">Schools</div>
            <div className="stat-value">{SCHOOLS_DATA.length}</div>
            <div className="stat-sub" style={{ color: '#00e676' }}>Multi-State</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Students</div>
            <div className="stat-value">{totalStudents}</div>
            <div className="stat-sub" style={{ color: '#00e676' }}>493 active</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Competitions</div>
            <div className="stat-value">3</div>
            <div className="stat-sub" style={{ color: 'var(--blue)' }}>1 active</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Partners</div>
            <div className="stat-value">4</div>
            <div className="stat-sub" style={{ color: 'var(--yellow)' }}>$50K+ revenue</div>
          </div>
        </div>

        {/* Schools Overview table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Schools Overview
            </span>
            <button className="btn btn-primary" style={{ fontSize: 11, padding: '4px 14px', background: 'linear-gradient(90deg, rgba(0,230,118,0.8), #00e676)', color: 'var(--bg)', fontWeight: 700 }}>
              + Add School
            </button>
          </div>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>School</th>
                <th>ZIP</th>
                <th>Students</th>
                <th>Active</th>
                <th>LMI %</th>
                <th>Completion</th>
                <th>Quiz Avg</th>
                <th>Since</th>
              </tr>
            </thead>
            <tbody>
              {SCHOOLS_DATA.map(s => (
                <tr key={s.name}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text3)' }}>{s.zip}</td>
                  <td style={{ fontFamily: 'monospace' }}>{s.students}</td>
                  <td style={{ fontFamily: 'monospace', color: '#00e676' }}>{s.active}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '1px 7px', borderRadius: 20, fontSize: 11, fontWeight: 700, ...lmiBadgeStyle(s.lmi) }}>
                      {s.lmi}%
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 60, height: 5, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${s.comp}%`, background: 'linear-gradient(90deg, #00e676, var(--blue))', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--text2)' }}>{s.comp}%</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>{s.qa}%</td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text3)' }}>{s.since}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
