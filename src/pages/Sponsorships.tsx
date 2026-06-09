const TIERS = [
  {
    tier: 'Community',
    price: '$5K/yr',
    color: '#00e676',
    active: false,
    benefits: [
      'Logo on student app',
      '1 field trip/year',
      'Quarterly impact report',
      'Social media recognition',
    ],
  },
  {
    tier: 'Gold',
    price: '$15K/yr',
    color: 'var(--yellow)',
    active: false,
    benefits: [
      'All Community benefits',
      '1 speaker/semester',
      '2 field trips',
      'Competition branding',
      'ETF Builder leaderboard view',
    ],
  },
  {
    tier: 'Presenting',
    price: '$30K/yr',
    color: '#00e676',
    active: true,
    benefits: [
      'All Gold benefits',
      '2 speakers/semester',
      '3 field trips',
      'Naming rights',
      'Full talent pipeline access',
      'Mentor program access',
      'CRA reporting dashboard',
      'Scholarship option',
    ],
  },
];

export default function Sponsorships() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {TIERS.map(t => (
            <div
              key={t.tier}
              className="card"
              style={{
                padding: 0,
                overflow: 'hidden',
                ...(t.active ? { border: '1px solid rgba(0,230,118,0.4)', background: 'rgba(0,230,118,0.04)' } : {}),
              }}
            >
              {/* Header */}
              <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', minHeight: 38, display: 'flex', alignItems: 'center' }}>
                {t.active && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(0,230,118,0.12)', color: '#00e676', border: '1px solid rgba(0,230,118,0.3)' }}>
                    YOUR TIER
                  </span>
                )}
              </div>

              {/* Body */}
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.color, marginBottom: 6, fontFamily: 'monospace' }}>
                  {t.tier}
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 16, fontFamily: 'monospace' }}>
                  {t.price}
                </div>
                <div style={{ height: 1, background: 'var(--border)', marginBottom: 14 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {t.benefits.map(b => (
                    <div key={b} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ color: '#00e676', fontSize: 10, flexShrink: 0 }}>▶</span>
                      <span style={{ fontSize: 12, color: 'var(--text2)' }}>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
