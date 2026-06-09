import { useApp } from '../state/AppContext';

const FIELD_TRIPS = [
  {
    id: 'ft1',
    category: 'Financial Partner',
    icon: '🏛',
    title: 'Partner Institution Visit',
    desc: 'Trading floor tour, meet analysts',
    date: 'May 3',
    spots: 10,
    enrolled: 3,
    reqText: 'Top 10 + Grade 10+',
    minGrade: 10,
    xpRequired: 1000,
  },
  {
    id: 'ft2',
    category: 'Partner Exchange',
    icon: '📊',
    title: 'Options Exchange Floor Tour',
    desc: 'Live options demo, meet market makers',
    date: 'May 17',
    spots: 20,
    enrolled: 11,
    reqText: 'Level 2 + Quiz 98%+ + G11+',
    minGrade: 11,
    xpRequired: 1500,
  },
  {
    id: 'ft3',
    category: 'Partner Firm',
    icon: '💎',
    title: 'Partner Firm Tour',
    desc: 'Exclusive institutional partner tour',
    date: 'Jun 5',
    spots: 5,
    enrolled: 1,
    reqText: 'Top 3 Nationally + Grade 12',
    minGrade: 12,
    xpRequired: 3000,
  },
];

const USER_GRADE = 11;

export default function FieldTrips() {
  const { state, dispatch } = useApp();
  const xp = state.u[state.role].xp;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Field Trips</div>
          <div className="page-subtitle">Exclusive visits to partner firms and financial institutions</div>
        </div>
      </div>

      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
          {FIELD_TRIPS.map(trip => {
            const xpMet = xp >= trip.xpRequired;
            const gradeMet = USER_GRADE >= trip.minGrade;
            const eligible = xpMet && gradeMet;

            return (
              <div
                key={trip.id}
                className="card"
                style={{ padding: 0, overflow: 'hidden' }}
              >
                {/* Card header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text2)' }}>
                    <span style={{ fontSize: 16 }}>{trip.icon}</span>
                    {trip.category}
                  </div>
                  {eligible ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '3px 10px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        background: 'rgba(0,230,118,0.12)',
                        color: '#00e676',
                        border: '1px solid rgba(0,230,118,0.3)',
                      }}
                    >
                      ✓ ELIGIBLE
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '3px 10px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        background: 'var(--surface2)',
                        color: 'var(--text3)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      LOCKED
                    </span>
                  )}
                </div>

                {/* Body */}
                <div style={{ padding: '16px 16px 0' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                    {trip.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14 }}>
                    {trip.desc}
                  </div>

                  {/* Date / Spots info boxes */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    <div
                      style={{
                        background: 'var(--surface2)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        padding: '8px 12px',
                      }}
                    >
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                        Date
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{trip.date}</div>
                    </div>
                    <div
                      style={{
                        background: 'var(--surface2)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        padding: '8px 12px',
                      }}
                    >
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                        Spots
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                        {trip.enrolled}/{trip.spots}
                      </div>
                    </div>
                  </div>

                  {/* Requirements box */}
                  <div
                    style={{
                      background: 'var(--surface2)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      padding: '10px 12px',
                      marginBottom: 14,
                    }}
                  >
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>Requirements:</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#00e676', marginBottom: 10 }}>
                      {trip.reqText}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>Min Grade:</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: gradeMet ? '#00e676' : 'var(--red)' }}>
                        Grade {trip.minGrade}+ {gradeMet ? '✓' : '✗'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>XP Required:</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: xpMet ? '#00e676' : 'var(--red)' }}>
                        {trip.xpRequired.toLocaleString()} {xpMet ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer — button or locked message */}
                <div style={{ padding: '0 16px 16px' }}>
                  {eligible ? (
                    <button
                      className="btn btn-primary"
                      style={{
                        width: '100%',
                        background: 'linear-gradient(90deg, #00b891, #00e676)',
                        color: '#07111c',
                        fontWeight: 700,
                      }}
                      onClick={() => dispatch({ type: 'ADD_XP', amount: 25 })}
                    >
                      ✓ Register Interest
                    </button>
                  ) : (
                    <div
                      style={{
                        textAlign: 'center',
                        fontSize: 13,
                        color: 'var(--text3)',
                        padding: '10px 0',
                      }}
                    >
                      🔒 Requirements Not Met
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
