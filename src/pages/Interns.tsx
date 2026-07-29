import { useState } from 'react';
import { useApp } from '../state/AppContext';
import { INTERNSHIP_DATA } from '../data/internships';

export default function Interns() {
  const { state } = useApp();
  const user = state.u[state.role];
  const xp = user.xp;
  const userGrade = (user as any).grade ?? 9;

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const activeInternship = INTERNSHIP_DATA.find(i => i.id === activeModal) ?? null;

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
            const gradeMet = userGrade >= i.minGrade;
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
                      onClick={() => setActiveModal(i.id)}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(90deg, #00b891, #00e676)',
                        color: '#07111c',
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: 'pointer',
                      }}
                    >
                      Apply Now →
                    </button>
                  ) : (
                    <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text3)', padding: '10px 0' }}>
                      Not Eligible Yet
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {activeInternship && (
        <div
          onClick={() => setActiveModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="card"
            style={{
              maxWidth: 480,
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{activeInternship.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>{activeInternship.partner}</div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text3)',
                  fontSize: 20,
                  cursor: 'pointer',
                  lineHeight: 1,
                  padding: 0,
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
              How to apply
            </div>

            <ol style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activeInternship.applicationSteps.map((step, idx) => (
                <li key={idx} style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>
                  {step}
                </li>
              ))}
            </ol>

            <div
              style={{
                marginTop: 16,
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '10px 12px',
                fontSize: 12,
                color: 'var(--text3)',
              }}
            >
              Questions? Reach out to{' '}
              <a href={`mailto:${activeInternship.contactEmail}`} style={{ color: '#00e676' }}>
                {activeInternship.contactEmail}
              </a>
            </div>

            <button
              className="btn"
              onClick={() => setActiveModal(null)}
              style={{
                width: '100%',
                marginTop: 16,
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
