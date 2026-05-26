export default function Sponsorships() {
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Sponsorships 💰</div>
          <div className="page-subtitle">Financial commitments and program funding</div>
        </div>
      </div>
      <div className="page-body">
        <div className="stats-row" style={{ marginBottom: 24 }}>
          {[
            { label: 'Annual Commitment', value: '$75,000' },
            { label: 'Schools Funded', value: '3' },
            { label: 'Students Supported', value: '134' },
            { label: 'CRA Credit Category', value: 'LMI Education' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ fontSize: 20 }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="section-title">Funding Breakdown</div>
        <div className="card" style={{ marginBottom: 20 }}>
          {[
            { item: 'School Licensing (3 schools)', amount: '$30,000', pct: 40 },
            { item: 'Field Trip Sponsorships', amount: '$15,000', pct: 20 },
            { item: 'Scholarship Fund', amount: '$20,000', pct: 27 },
            { item: 'Technology & Infrastructure', amount: '$10,000', pct: 13 },
          ].map(f => (
            <div key={f.item} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>{f.item}</span>
                <span style={{ color: 'var(--gr)', fontWeight: 600 }}>{f.amount}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${f.pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">Renewal Information</div>
          <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
            <div>
              <div style={{ color: 'var(--text3)' }}>Contract Start</div>
              <div style={{ fontWeight: 600 }}>January 1, 2026</div>
            </div>
            <div>
              <div style={{ color: 'var(--text3)' }}>Contract End</div>
              <div style={{ fontWeight: 600 }}>December 31, 2026</div>
            </div>
            <div>
              <div style={{ color: 'var(--text3)' }}>Status</div>
              <span className="badge badge-green">Active</span>
            </div>
          </div>
          <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>
            Request Renewal Proposal
          </button>
        </div>
      </div>
    </div>
  );
}
