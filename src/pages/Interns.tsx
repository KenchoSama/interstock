import { useApp } from '../state/AppContext';

const INTERNSHIP_DATA = [
  {
    id: 'int1',
    title: 'Summer Finance Internship',
    partner: 'Financial Partner',
    type: 'Paid' as const,
    comp: '$25/hr',
    period: 'Jun-Aug',
    spots: 3,
    minGrade: 12,
    reqText: 'Top 5 nationally · Gr12 · XP 3000+',
    xpReq: 3000,
  },
  {
    id: 'int2',
    title: 'Options Desk Shadowing',
    partner: 'Partner Exchange',
    type: 'Unpaid' as const,
    comp: 'Credit',
    period: 'Jul 2025',
    spots: 5,
    minGrade: 11,
    reqText: 'Level 2 · Gr11-12 · XP 2000+',
    xpReq: 2000,
  },
];

const USER_GRADE = 11;

export default function Interns() {
  const { state } = useApp();
  const xp = state.u[state.role].xp;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Internships</div>
          <div className="page-subtitle">Real-world finance opportunities with our partner firms</div>
        </div>
      </div>

      <div className="page-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {INTERNSHIP_DATA.map(i => {
            const xpMet = xp >= i.xpReq;
            const gradeMet = USER_GRADE >= i.minGrade;
            const eligible = xpMet && gradeMet;

            return (
              <div key={i.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>

                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 18px',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>🏦</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{i.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{i.partner}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '2px 10px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        background: i.type === 'Paid' ? 'rgba(0,230,118,0.12)' : 'var(--surface2)',
                        color: i.type === 'Paid' ? '#00e676' : 'var(--text3)',
                        border: `1px solid ${i.type === 'Paid' ? 'rgba(0,230,118,0.3)' : 'var(--border)'}`,
                      }}
                    >
                      {i.type}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#00e676', fontFamily: 'monospace' }}>
                      {i.comp}
                    </span>
                  </div>
                </div>

                {/* Metric boxes */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '14px 18px 10px' }}>
                  {[
                    { label: 'Period', value: i.period, color: 'var(--text)' },
                    { label: 'Spots', value: String(i.spots), color: '#00e676' },
                    {
                      label: 'Min Grade',
                      value: `Grade ${i.minGrade}+ ${gradeMet ? '✓' : '✗'}`,
                      color: gradeMet ? '#00e676' : 'var(--red)',
                    },
                  ].map(box => (
                    <div
                      key={box.label}
                      style={{
                        background: 'var(--surface2)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        padding: '8px 12px',
                      }}
                    >
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>
                        {box.label}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: box.color, fontFamily: 'monospace' }}>
                        {box.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Requirements box */}
                <div style={{ padding: '0 18px 14px' }}>
                  <div
                    style={{
                      background: 'var(--surface2)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      padding: '10px 12px',
                      fontFamily: 'monospace',
                      fontSize: 11,
                    }}
                  >
                    <div style={{ color: 'var(--text3)', marginBottom: 5 }}>Requirements:</div>
                    <div style={{ color: '#00e676', marginBottom: 10 }}>{i.reqText}</div>
                    <div style={{ height: 1, background: 'var(--border)', marginBottom: 10 }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text3)' }}>XP:</span>
                      <span style={{ color: xpMet ? '#00e676' : 'var(--red)', fontWeight: 600 }}>
                        {i.xpReq.toLocaleString()}{' '}
                        {xpMet ? '✓' : `✗ Need ${(i.xpReq - xp).toLocaleString()} more`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '0 18px 16px' }}>
                  {eligible ? (
                    <button
                      className="btn"
                      style={{
                        width: '100%',
                        background: 'linear-gradient(90deg, #00b891, #00e676)',
                        color: '#07111c',
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      Apply Now →
                    </button>
                  ) : (
                    <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text3)', padding: '10px 0' }}>
                      🔒 Not Eligible Yet
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
