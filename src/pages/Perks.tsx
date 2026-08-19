export default function Perks() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Student Perks 🎁</div>
          <div className="page-subtitle">Exclusive discounts from InterStock partner brands</div>
        </div>
      </div>

      <div className="page-body">
        <div className="card" style={{ padding: 0, overflow: 'hidden', maxWidth: 720 }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>🍇</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>OAKBERRY</span>
            </div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '3px 10px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                background: 'rgba(0,230,118,0.12)',
                color: '#00e676',
                border: '1px solid rgba(0,230,118,0.3)',
              }}
            >
              ACTIVE PERK
            </span>
          </div>

          {/* Body */}
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
              20% Off for InterStock Students
            </div>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16, lineHeight: 1.6 }}>
              OAKBERRY Açaí is a global juice bar franchise known for its açaí bowls, smoothies, and juices
              made from sustainably sourced Brazilian açaí berries. As an InterStock student, you get a
              standing discount at participating OAKBERRY locations — just show your InterStock profile at
              checkout.
            </div>

            {/* Discount code box */}
            <div
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '14px 16px',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                  Your Discount
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#00e676', fontFamily: 'monospace' }}>
                  20% OFF
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                  Code
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', fontFamily: 'monospace' }}>
                  INTERSTOCK20
                </div>
              </div>
            </div>

            {/* How to redeem */}
            <div
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '10px 12px',
                marginBottom: 4,
              }}
            >
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>How to redeem:</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
                1. Visit any participating OAKBERRY location.<br />
                2. Show your InterStock student profile or ID card at checkout.<br />
                3. Mention code <strong style={{ color: 'var(--text)' }}>INTERSTOCK20</strong> for 20% off your order.
              </div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 12, maxWidth: 720 }}>
          Discount valid at participating OAKBERRY locations only. One use per visit. Not combinable with
          other offers. Subject to change at partner's discretion.
        </div>
      </div>
    </div>
  );
}
