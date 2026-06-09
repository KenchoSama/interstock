const STUDENTS = [
  { name: 'Marcus Rivera',   school: 'Lincoln HS', grade: '11th', lmi: true,  lv: 1, xp: 3240, rank: 23,  status: 'active'  },
  { name: 'Sofia Castillo',  school: 'Lincoln HS', grade: '10th', lmi: true,  lv: 1, xp: 2800, rank: 42,  status: 'active'  },
  { name: 'Diego Fernandez', school: 'Lincoln HS', grade: '11th', lmi: true,  lv: 1, xp: 1200, rank: 89,  status: 'at_risk' },
  { name: 'Layla Hassan',    school: 'Lincoln HS', grade: '12th', lmi: false, lv: 2, xp: 4800, rank: 6,   status: 'active'  },
  { name: 'Tyler Brooks',    school: 'Lincoln HS', grade: '10th', lmi: true,  lv: 1, xp: 400,  rank: 312, status: 'at_risk' },
  { name: 'Ana Gutierrez',   school: 'Lincoln HS', grade: '11th', lmi: true,  lv: 1, xp: 2900, rank: 31,  status: 'active'  },
  { name: 'Jordan Smith',    school: 'Lincoln HS', grade: '12th', lmi: false, lv: 2, xp: 4200, rank: 9,   status: 'active'  },
];

export default function AllStudents() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-body">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              All Students
            </span>
            <button className="btn btn-primary" style={{ fontSize: 11, padding: '4px 14px', background: 'linear-gradient(90deg, rgba(0,230,118,0.8), #00e676)', color: 'var(--bg)', fontWeight: 700 }}>
              Export CSV
            </button>
          </div>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Student</th>
                <th>School</th>
                <th>Grade</th>
                <th>LMI</th>
                <th>Level</th>
                <th>XP</th>
                <th>Rank</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {STUDENTS.map(s => (
                <tr key={s.name}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td style={{ color: 'var(--text3)', fontSize: 11 }}>{s.school}</td>
                  <td style={{ fontFamily: 'monospace' }}>{s.grade}</td>
                  <td>
                    {s.lmi && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 4, fontSize: 11, fontWeight: 700, background: 'rgba(0,230,118,0.12)', color: '#00e676', border: '1px solid rgba(0,230,118,0.3)' }}>
                        ✓
                      </span>
                    )}
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: 'var(--blue-dim)', color: 'var(--blue)' }}>
                      L{s.lv}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', color: '#00e676', fontWeight: 600 }}>{s.xp.toLocaleString()}</td>
                  <td style={{ fontFamily: 'monospace' }}>#{s.rank}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: s.status === 'at_risk' ? 'var(--red-dim)' : 'rgba(0,230,118,0.12)', color: s.status === 'at_risk' ? 'var(--red)' : '#00e676' }}>
                      {s.status === 'at_risk' ? 'AT RISK' : 'ACTIVE'}
                    </span>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 10, padding: 14, fontFamily: 'monospace' }}>
                  ··· 485 more students across all schools ···
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
