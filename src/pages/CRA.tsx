import { lineChart } from '../utils/charts';

const SCHOOLS_DATA = [
  { name: 'Lincoln High School',  zip: '—', students: 124, active: 112, lmi: 68, qa: 83, comp: 52 },
  { name: 'Westlake HS',          zip: '—', students:  98, active:  91, lmi: 45, qa: 87, comp: 61 },
  { name: 'Riverside HS',         zip: '—', students:  87, active:  79, lmi: 63, qa: 81, comp: 48 },
  { name: 'St. Joseph Academy',   zip: '—', students:  76, active:  74, lmi: 78, qa: 91, comp: 71 },
  { name: 'Horizon Academy',      zip: '—', students:  63, active:  55, lmi: 79, qa: 79, comp: 44 },
  { name: 'Summit Prep',          zip: '—', students:  45, active:  48, lmi: 29, qa: 85, comp: 58 },
];

const TALENT = [
  { name: 'Layla Hassan',    grade: '12th', lmi: true,  xp: 4800, qa: 94, hrs: 68, score: 96, status: 'active'  },
  { name: 'Jordan Smith',    grade: '12th', lmi: false, xp: 4200, qa: 89, hrs: 62, score: 84, status: 'active'  },
  { name: 'Marcus Rivera',   grade: '11th', lmi: true,  xp: 3240, qa: 98, hrs: 38, score: 74, status: 'active'  },
  { name: 'Ana Gutierrez',   grade: '11th', lmi: true,  xp: 2900, qa: 91, hrs: 44, score: 71, status: 'active'  },
  { name: 'Sofia Castillo',  grade: '10th', lmi: true,  xp: 2800, qa: 87, hrs: 52, score: 79, status: 'active'  },
  { name: 'Diego Fernandez', grade: '11th', lmi: true,  xp: 1200, qa: 78, hrs: 28, score: 54, status: 'at_risk' },
  { name: 'Tyler Brooks',    grade: '10th', lmi: true,  xp:  400, qa: 72, hrs: 14, score: 46, status: 'at_risk' },
];

const ENGAGEMENT = [
  { label: 'Daily active users',    value: '412'    },
  { label: 'Avg session time',      value: '28 min' },
  { label: 'Paper trades',          value: '14,288' },
  { label: 'Scenario plays',        value: '8,948'  },
  { label: 'Assignments submitted', value: '2,847'  },
];

const TALENT_METRICS = [
  { label: 'Eligible for internships', value: '48'    },
  { label: 'With partner mentors',     value: '22'    },
  { label: 'Field trip slots filled',  value: '19/42' },
  { label: 'Referrals sent',           value: '12'    },
  { label: 'Partner hire conversions', value: '4'     },
];

const LITERACY_SCORES = [42, 45, 49, 53, 57, 60, 63, 66, 69, 72, 75, 78];
const chartSvg = lineChart(LITERACY_SCORES, 550, 120, '#00e676');

function lmiBadgeStyle(lmi: number) {
  if (lmi >= 60) return { background: 'rgba(0,230,118,0.12)', color: '#00e676' };
  if (lmi >= 40) return { background: 'rgba(249,199,79,0.12)', color: 'var(--yellow)' };
  return { background: 'var(--surface2)', color: 'var(--text3)' };
}

function rankBadge(i: number): React.CSSProperties {
  const base: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 5, fontWeight: 700, fontSize: 12 };
  if (i === 0) return { ...base, background: 'rgba(249,199,79,0.2)', color: 'var(--yellow)' };
  if (i === 1) return { ...base, background: 'rgba(180,180,200,0.15)', color: '#b0b8c8' };
  if (i === 2) return { ...base, background: 'rgba(205,127,50,0.15)', color: '#cd7f32' };
  return { ...base, background: 'var(--surface2)', color: 'var(--text3)' };
}

function SidePanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 12 }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
        {title}
      </div>
      <div style={{ padding: '10px 14px' }}>{children}</div>
    </div>
  );
}

function MetricRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 11, color: 'var(--text2)' }}>{label}</span>
      <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 600, color: valueColor ?? 'var(--text)' }}>{value}</span>
    </div>
  );
}

export default function CRA() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-body">

        {/* Top stat cards */}
        <div className="stats-row" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-label">Completion Rate</div>
            <div className="stat-value">91%</div>
            <div className="stat-sub" style={{ color: '#00e676' }}>Active/enrolled</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Quiz Average</div>
            <div className="stat-value">84%</div>
            <div className="stat-sub" style={{ color: 'var(--text3)' }}>National avg: 81%</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Partner Schools</div>
            <div className="stat-value">6</div>
            <div className="stat-sub" style={{ color: 'var(--blue)' }}>Multi-State</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Talent Pipeline</div>
            <div className="stat-value">847</div>
            <div className="stat-sub" style={{ color: 'var(--yellow)' }}>Ranked students</div>
          </div>
        </div>

        {/* Main 2-col layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16, marginBottom: 16 }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* School Breakdown Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                School Performance &amp; LMI Breakdown
              </div>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>School</th>
                    <th>ZIP</th>
                    <th>Students</th>
                    <th>Active</th>
                    <th>LMI %</th>
                    <th>Quiz Avg</th>
                    <th>Completion</th>
                    <th>Hours</th>
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
                      <td style={{ fontFamily: 'monospace' }}>{s.qa}%</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 60, height: 5, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${s.comp}%`, background: '#00e676', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--text2)' }}>{s.comp}%</span>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace' }}>{(s.active * 38).toLocaleString()} hrs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Literacy Score Chart */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Financial Literacy Score Improvement
              </div>
              <div style={{ padding: '16px 16px 0' }}>
                <div style={{ height: 120 }} dangerouslySetInnerHTML={{ __html: chartSvg }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
                {[
                  { label: 'Pre-Program', value: '42', color: 'var(--yellow)' },
                  { label: 'Current',     value: '78', color: '#00e676' },
                  { label: 'Improvement', value: '+86%', color: 'var(--gr)' },
                ].map((m, i) => (
                  <div key={m.label} style={{ padding: '12px 16px', textAlign: 'center', borderTop: '1px solid var(--border)', borderLeft: i > 0 ? '1px solid var(--border)' : undefined }}>
                    <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'monospace', color: m.color }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div>
            <SidePanel title="Engagement">
              {ENGAGEMENT.map(m => <MetricRow key={m.label} label={m.label} value={m.value} />)}
            </SidePanel>

            <SidePanel title="Talent Pipeline">
              <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 10, padding: '8px 10px', background: 'var(--surface2)', borderRadius: 6, border: '1px solid var(--border)' }}>
                🏦 InterStock surfaces top students to institutional partners — a measurable pipeline from underrepresented communities to financial careers.
              </div>
              {TALENT_METRICS.map(m => <MetricRow key={m.label} label={m.label} value={m.value} valueColor="#00e676" />)}
            </SidePanel>

            <SidePanel title="Reporting">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button className="btn btn-primary btn-sm" style={{ width: '100%', background: 'linear-gradient(90deg, var(--gr2), #00e676)', color: 'var(--bg)' }}>
                  📥 Download CRA Report (PDF)
                </button>
                <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                  📊 Export Data (CSV)
                </button>
                <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                  📧 Email to Compliance
                </button>
              </div>
            </SidePanel>
          </div>
        </div>

        {/* Talent Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Top-Performing Students — Talent Pipeline
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(0,230,118,0.12)', color: '#00e676' }}>
              RANKED
            </span>
          </div>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student</th>
                <th>Grade</th>
                <th>LMI</th>
                <th>XP</th>
                <th>Quiz Avg</th>
                <th>Hours</th>
                <th>Lit. Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {TALENT.map((s, i) => (
                <tr key={s.name}>
                  <td><div style={rankBadge(i)}>{i + 1}</div></td>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td style={{ fontFamily: 'monospace' }}>{s.grade}</td>
                  <td>
                    {s.lmi && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '1px 7px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(0,230,118,0.12)', color: '#00e676' }}>
                        ✓ LMI
                      </span>
                    )}
                  </td>
                  <td style={{ fontFamily: 'monospace', color: '#00e676', fontWeight: 600 }}>{s.xp.toLocaleString()}</td>
                  <td style={{ fontFamily: 'monospace' }}>{s.qa}%</td>
                  <td style={{ fontFamily: 'monospace' }}>{s.hrs} hrs</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(0,230,118,0.12)', color: '#00e676' }}>
                      {s.score}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: s.status === 'at_risk' ? 'var(--red-dim)' : 'rgba(0,230,118,0.12)', color: s.status === 'at_risk' ? 'var(--red)' : '#00e676' }}>
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
