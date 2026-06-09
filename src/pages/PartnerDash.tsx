const ETF_BUILDERS = [
  { etf: 'Growth & Income ETF', student: 'Layla Hassan',    school: 'Lincoln HS',   rt: 22.4, grade: '12th', lmi: false },
  { etf: 'Tech Titans Fund',    student: 'Jordan Smith',    school: 'Lincoln HS',   rt: 18.1, grade: '12th', lmi: false },
  { etf: 'Balance Pro ETF',     student: 'Sofia Castillo',  school: 'Westlake HS',  rt: 15.9, grade: '10th', lmi: true  },
  { etf: 'Global Diversified',  student: 'Ana Gutierrez',   school: 'Lincoln HS',   rt: 14.2, grade: '11th', lmi: true  },
];

export default function PartnerDash() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-body">

        {/* Stat cards */}
        <div className="stats-row" style={{ marginBottom: 20 }}>
          <div className="stat-card" style={{ borderLeft: '3px solid #00e676' }}>
            <div className="stat-label">Brand Impressions</div>
            <div className="stat-value">42,800</div>
            <div className="stat-sub" style={{ color: '#00e676' }}>+18% this semester</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Students Reached</div>
            <div className="stat-value">493</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Mentors</div>
            <div className="stat-value">1</div>
            <div className="stat-sub" style={{ color: '#00e676' }}>Assigned</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Talent Pipeline</div>
            <div className="stat-value">847</div>
            <div className="stat-sub" style={{ color: '#00e676' }}>Trackable</div>
          </div>
        </div>

        {/* ETF Builders table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#00e676', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Top ETF Builders — Your Exclusive Pipeline View
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(0,230,118,0.12)', color: '#00e676', border: '1px solid rgba(0,230,118,0.3)' }}>
              PARTNER ONLY
            </span>
          </div>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>ETF Name</th>
                <th>Student</th>
                <th>School</th>
                <th>Return</th>
                <th>Grade</th>
                <th>LMI</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {ETF_BUILDERS.map(r => (
                <tr key={r.etf}>
                  <td style={{ fontWeight: 700 }}>{r.etf}</td>
                  <td style={{ fontWeight: 600 }}>{r.student}</td>
                  <td style={{ color: 'var(--text3)' }}>{r.school}</td>
                  <td style={{ fontFamily: 'monospace', color: '#00e676', fontWeight: 600 }}>+{r.rt}%</td>
                  <td style={{ fontFamily: 'monospace' }}>{r.grade}</td>
                  <td>
                    {r.lmi && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '1px 7px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(0,230,118,0.12)', color: '#00e676' }}>
                        ✓ LMI
                      </span>
                    )}
                  </td>
                  <td>
                    <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 12px' }}>
                      View Profile
                    </button>
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
