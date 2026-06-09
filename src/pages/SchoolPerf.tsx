const CITY_QUIZ_AVG  = 81;
const SCHOOL_AVG    = 86;
const BEST_RANK     = 6;
const SCHOOL_RANK   = 3;
const TOTAL_SCHOOLS = 6;

const MODULE_SCORES = [
  { name: 'Marcus Rivera',   scores: [95, 87, 98, 89, 92] },
  { name: 'Sofia Castillo',  scores: [92, 84, 95, 86, 89] },
  { name: 'Diego Fernandez', scores: [83, 75, 86, 77, 80] },
  { name: 'Layla Hassan',    scores: [99, 91, 100, 93, 96] },
  { name: 'Tyler Brooks',    scores: [77, 69, 80, 71, 74] },
  { name: 'Ana Gutierrez',   scores: [96, 88, 99, 90, 93] },
  { name: 'Jordan Smith',    scores: [94, 86, 97, 88, 91] },
].map(s => ({
  ...s,
  average: Math.round(s.scores.reduce((a, b) => a + b, 0) / s.scores.length),
}));

function scoreColor(v: number) {
  if (v >= 90) return '#00e676';
  if (v < 75)  return 'var(--red)';
  return 'var(--text)';
}

export default function SchoolPerf() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-body">

        {/* Stat cards */}
        <div className="stats-row" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-label">City Quiz Avg</div>
            <div className="stat-value">{CITY_QUIZ_AVG}%</div>
          </div>
          <div className="stat-card" style={{ borderLeft: '3px solid #00e676' }}>
            <div className="stat-label">Your School</div>
            <div className="stat-value" style={{ color: '#00e676' }}>{SCHOOL_AVG}%</div>
            <div className="stat-sub" style={{ color: '#00e676' }}>+{SCHOOL_AVG - CITY_QUIZ_AVG}% above city</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Best Rank</div>
            <div className="stat-value">#{BEST_RANK}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">School Rank</div>
            <div className="stat-value">#{SCHOOL_RANK}</div>
            <div className="stat-sub">of {TOTAL_SCHOOLS} schools</div>
          </div>
        </div>

        {/* Module performance table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Performance by Module
          </div>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Student</th>
                <th>M1</th>
                <th>M2</th>
                <th>M3</th>
                <th>M4</th>
                <th>M5</th>
                <th>Average</th>
              </tr>
            </thead>
            <tbody>
              {MODULE_SCORES.map(s => (
                <tr key={s.name}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  {s.scores.map((v, i) => (
                    <td key={i} style={{ fontFamily: 'monospace', color: scoreColor(v) }}>{v}%</td>
                  ))}
                  <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{s.average}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
