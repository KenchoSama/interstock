export default function StaffAssign() {
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Staff Assignments 📝</div>
          <div className="page-subtitle">Tasks assigned by the InterStock team</div>
        </div>
      </div>
      <div className="page-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { title: 'Q1 CRA Impact Data Collection', due: '2026-04-01', status: 'completed', school: 'All Schools', note: 'Collect XP totals, diploma counts, and engagement rates for Q1.' },
            { title: 'Lincoln HS Monthly Check-in', due: '2026-05-15', status: 'completed', school: 'Lincoln High School', note: 'Review engagement dashboard and discuss struggling students with Ms. Lewis.' },
            { title: 'New School Onboarding — Westfield', due: '2026-06-01', status: 'pending', school: 'Westfield High', note: 'Schedule kickoff meeting, set up admin account, and train school coordinator.' },
            { title: 'Summer Field Trip Coordination', due: '2026-06-10', status: 'pending', school: 'All Schools', note: 'Confirm NYSE and BlackRock visit logistics. Collect permission forms from enrolled students.' },
          ].map((a, i) => (
            <div key={i} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>
                    🏫 {a.school} · 📅 Due {a.due}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{a.note}</div>
                </div>
                <span className={`badge ${a.status === 'completed' ? 'badge-green' : 'badge-yellow'}`}>
                  {a.status === 'completed' ? '✓ Done' : 'Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
