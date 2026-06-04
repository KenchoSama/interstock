import { SCHOOLS, STUDENTS } from '../data';

export default function CRA() {
  const totalStudents = SCHOOLS.reduce((s, sch) => s + sch.students, 0);
  const lmiSchools = SCHOOLS.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div className="page-header">
        <div>
          <div className="page-title">CRA Impact Report 📋</div>
          <div className="page-subtitle">Community Reinvestment Act — Q1 2026 Report</div>
        </div>
      </div>
      <div className="page-body">
        <div className="card" style={{ background: 'var(--gr-dim)', borderColor: 'var(--gr2)', marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>CRA Qualifying Activity</div>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>
            InterStock's financial literacy program qualifies as a Community Development Service under the Community Reinvestment Act,
            targeting low-to-moderate income communities in 6 cities.
          </div>
        </div>

        <div className="stats-row" style={{ marginBottom: 24 }}>
          {[
            { label: 'LMI Schools Served', value: lmiSchools.toString(), sub: '100% LMI-qualifying' },
            { label: 'Students Reached', value: totalStudents.toString(), sub: 'Q1 2026' },
            { label: 'Cities Impacted', value: '6', sub: 'Chicago, Detroit, Atlanta, Baltimore, Houston, LA' },
            { label: 'Partner Bank Hours', value: '142', sub: 'CRA-qualifying service hours' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid-2" style={{ gap: 20, marginBottom: 20 }}>
          <div className="card">
            <div className="card-title">Program Outcomes Q1 2026</div>
            {[
              { metric: 'Lessons Completed', value: '1,247' },
              { metric: 'Scenario Challenges Played', value: '893' },
              { metric: 'Diplomas Issued', value: '47' },
              { metric: 'Field Trips Completed', value: '2' },
              { metric: 'Internship Placements', value: '1' },
              { metric: 'Avg XP per Student', value: '1,380' },
            ].map(r => (
              <div key={r.metric} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span style={{ color: 'var(--text2)' }}>{r.metric}</span>
                <span style={{ fontWeight: 600, color: 'var(--gr)' }}>{r.value}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-title">School Demographics</div>
            {SCHOOLS.map(s => (
              <div key={s.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}>
                  <span>{s.name}</span>
                  <span className="badge badge-green">LMI</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.city}, {s.state} · {s.students} students</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Export Report</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-primary">📄 Download PDF Report</button>
            <button className="btn btn-secondary">📊 Export CSV Data</button>
            <button className="btn btn-secondary">📧 Email to Partners</button>
          </div>
        </div>
      </div>
    </div>
  );
}
