const ROSTER = [
  { name: 'Marcus Rivera',   grade: '11th', lv: 1, comp: 45, quiz: 98, xp: 3240, rank: 23,  status: 'active'   },
  { name: 'Sofia Castillo',  grade: '10th', lv: 1, comp: 65, quiz: 87, xp: 2800, rank: 42,  status: 'active'   },
  { name: 'Diego Fernandez', grade: '11th', lv: 1, comp: 35, quiz: 78, xp: 1200, rank: 89,  status: 'at_risk'  },
  { name: 'Layla Hassan',    grade: '12th', lv: 2, comp: 82, quiz: 94, xp: 4800, rank: 6,   status: 'active'   },
  { name: 'Tyler Brooks',    grade: '10th', lv: 1, comp: 18, quiz: 72, xp: 400,  rank: 312, status: 'at_risk'  },
  { name: 'Ana Gutierrez',   grade: '11th', lv: 1, comp: 55, quiz: 91, xp: 2900, rank: 31,  status: 'active'   },
  { name: 'Jordan Smith',    grade: '12th', lv: 2, comp: 76, quiz: 89, xp: 4200, rank: 9,   status: 'active'   },
];

const enrolledCount  = ROSTER.length;
const avgCompletion  = Math.round(ROSTER.reduce((s, r) => s + r.comp, 0) / ROSTER.length);
const avgQuiz        = Math.round(ROSTER.reduce((s, r) => s + r.quiz, 0) / ROSTER.length);
const atRiskCount    = ROSTER.filter(r => r.status === 'at_risk').length;

export default function SchoolDash() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-body">

        {/* Stat cards */}
        <div className="stats-row" style={{ marginBottom: 20 }}>
          <div className="stat-card" style={{ borderLeft: '3px solid #00e676' }}>
            <div className="stat-label">Enrolled</div>
            <div className="stat-value">{enrolledCount}</div>
            <div className="stat-sub" style={{ color: '#00e676' }}>+3 this week</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Completion</div>
            <div className="stat-value">{avgCompletion}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Quiz Avg</div>
            <div className="stat-value">{avgQuiz}%</div>
            <div className="stat-sub" style={{ color: '#00e676' }}>Above national avg</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">At-Risk</div>
            <div className="stat-value" style={{ color: 'var(--red)' }}>{atRiskCount}</div>
          </div>
        </div>

        {/* Student Roster */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Student Roster
          </div>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Grade</th>
                <th>Level</th>
                <th>Progress</th>
                <th>Quiz</th>
                <th>XP</th>
                <th>Rank</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ROSTER.map(s => (
                <tr key={s.name}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td style={{ fontFamily: 'monospace' }}>{s.grade}</td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                      background: 'var(--blue-dim)', color: 'var(--blue)',
                    }}>
                      L{s.lv}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 70, height: 5, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${s.comp}%`, background: 'linear-gradient(90deg, #00e676, var(--blue))', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text2)' }}>{s.comp}%</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>{s.quiz}%</td>
                  <td style={{ fontFamily: 'monospace', color: '#00e676', fontWeight: 600 }}>{s.xp.toLocaleString()}</td>
                  <td style={{ fontFamily: 'monospace' }}>#{s.rank}</td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', padding: '2px 8px',
                      borderRadius: 6, fontSize: 11, fontWeight: 700,
                      background: s.status === 'at_risk' ? 'var(--red-dim)' : 'rgba(0,230,118,0.12)',
                      color: s.status === 'at_risk' ? 'var(--red)' : '#00e676',
                    }}>
                      {s.status === 'at_risk' ? 'AT RISK' : 'ACTIVE'}
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
