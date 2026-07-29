import { useState } from 'react';
import { useApp } from '../state/AppContext';
import { useFieldTrips } from '../hooks/useFieldTrips';

function formatTripDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function FieldTrips() {
  const { state } = useApp();
  const user = state.u[state.role];
  const xp = user.xp;

  const { trips, loading, error, register, unregister } = useFieldTrips();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleRegister = async (tripId: string) => {
    setPendingId(tripId);
    setActionError(null);
    const { error } = await register(tripId);
    if (error) setActionError(error);
    setPendingId(null);
  };

  const handleUnregister = async (tripId: string) => {
    setPendingId(tripId);
    setActionError(null);
    const { error } = await unregister(tripId);
    if (error) setActionError(error);
    setPendingId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Field Trips</div>
          <div className="page-subtitle">Exclusive visits to partner firms and financial institutions</div>
        </div>
      </div>

      <div className="page-body">
        {loading && (
          <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 13, padding: '40px 0' }}>
            Loading field trips…
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign: 'center', color: 'var(--red)', fontSize: 13, padding: '40px 0' }}>
            Couldn't load field trips. {error}
          </div>
        )}

        {!loading && !error && trips.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 13, padding: '40px 0' }}>
            No field trips scheduled right now — check back soon.
          </div>
        )}

        {actionError && (
          <div
            style={{
              background: 'rgba(255,82,82,0.1)',
              border: '1px solid var(--red)',
              color: 'var(--red)',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            {actionError}
          </div>
        )}

        {!loading && !error && trips.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
            {trips.map(trip => {
              const xpMet = xp >= trip.xp_required;
              const eligible = xpMet;
              const full = trip.enrolled >= trip.spots;
              const isPending = pendingId === trip.id;

              return (
                <div key={trip.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
                      {trip.category}
                    </div>
                    {trip.isRegistered ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '3px 10px',
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          background: 'rgba(0,178,255,0.12)',
                          color: '#00b2ff',
                          border: '1px solid rgba(0,178,255,0.3)',
                        }}
                      >
                        ✓ REGISTERED
                      </span>
                    ) : eligible ? (
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
                      {trip.description}
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
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                          {formatTripDate(trip.trip_date)}
                        </div>
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
                        <div style={{ fontSize: 14, fontWeight: 600, color: full ? 'var(--red)' : 'var(--text)' }}>
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
                        {trip.req_text}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--text3)' }}>XP Required:</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: xpMet ? '#00e676' : 'var(--red)' }}>
                          {trip.xp_required.toLocaleString()} {xpMet ? '✓' : '✗'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer — button or locked/full message */}
                  <div style={{ padding: '0 16px 16px' }}>
                    {trip.isRegistered ? (
                      <button
                        className="btn"
                        disabled={isPending}
                        onClick={() => handleUnregister(trip.id)}
                        style={{
                          width: '100%',
                          background: 'var(--surface2)',
                          border: '1px solid var(--border)',
                          color: 'var(--text)',
                          fontWeight: 600,
                          cursor: isPending ? 'default' : 'pointer',
                          opacity: isPending ? 0.6 : 1,
                        }}
                      >
                        {isPending ? 'Updating…' : 'Cancel Registration'}
                      </button>
                    ) : eligible && !full ? (
                      <button
                        className="btn btn-primary"
                        disabled={isPending}
                        onClick={() => handleRegister(trip.id)}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(90deg, #00b891, #00e676)',
                          color: '#07111c',
                          fontWeight: 700,
                          cursor: isPending ? 'default' : 'pointer',
                          opacity: isPending ? 0.6 : 1,
                        }}
                      >
                        {isPending ? 'Registering…' : '✓ Register Interest'}
                      </button>
                    ) : eligible && full ? (
                      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text3)', padding: '10px 0' }}>
                        Trip Full
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text3)', padding: '10px 0' }}>
                        Requirements Not Met
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
