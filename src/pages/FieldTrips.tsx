import { useApp } from '../state/AppContext';
import { TRIPS } from '../data';

export default function FieldTrips() {
  const { state, dispatch } = useApp();
  const xp = state.u[state.role].xp;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Field Trips ✈️</div>
          <div className="page-subtitle">Exclusive visits to Wall Street firms and financial institutions</div>
        </div>
      </div>
      <div className="page-body">
        {xp < 3000 && (
          <div className="card" style={{ background: 'var(--red-dim)', borderColor: 'var(--red)', marginBottom: 20 }}>
            <div style={{ color: 'var(--red)', fontWeight: 600 }}>🔒 Field Trips require 3,000 XP</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>
              You have {xp.toLocaleString()} XP. Keep earning to unlock these exclusive experiences!
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {TRIPS.map(trip => {
            const spotsLeft = trip.spots - trip.enrolled;
            const full = spotsLeft <= 0;
            return (
              <div key={trip.id} className="card" style={{ opacity: xp < 3000 ? 0.5 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 20 }}>{trip.type === 'Virtual' ? '💻' : '🏛️'}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{trip.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text2)' }}>{trip.company}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>
                      <span>📅 {trip.date}</span>
                      <span>👥 {trip.enrolled}/{trip.spots} enrolled</span>
                      <span className={`badge ${trip.type === 'Virtual' ? 'badge-blue' : 'badge-green'}`}>{trip.type}</span>
                    </div>
                  </div>
                  <div>
                    {full ? (
                      <span className="badge badge-red">Full</span>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={xp < 3000}
                        onClick={() => dispatch({ type: 'ADD_XP', amount: 50 })}
                      >
                        Enroll ({spotsLeft} left)
                      </button>
                    )}
                  </div>
                </div>
                <div className="progress-bar" style={{ marginTop: 12 }}>
                  <div className="progress-fill" style={{ width: `${(trip.enrolled / trip.spots) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
