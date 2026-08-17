import { useApp } from '../state/AppContext';
import { useMentorSchedule } from '../hooks/Usementorschedule';

const TIMES = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'];

function getWeekdays(count = 5) {
  const days: Date[] = [];
  const d = new Date();
  while (days.length < count) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) days.push(new Date(d));
  }
  return days;
}

export default function MentorSchedule() {
  const { state } = useApp();
  const user = state.u[state.role];
  const weekdays = getWeekdays();

  const { isAvailable, requestFor, toggleAvailability, respondToRequest, pendingRequests, loading, error } =
    useMentorSchedule(user.supabaseId ?? undefined, weekdays, TIMES);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Mentor Schedule</div>
          <div className="page-subtitle">Set your availability and manage meeting requests</div>
        </div>
      </div>

      <div className="page-body">
        {loading && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>
            Loading schedule...
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--red)', fontSize: 13 }}>
            Couldn't load schedule. {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Pending requests */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Pending Requests {pendingRequests.length > 0 && `(${pendingRequests.length})`}
              </div>
              {pendingRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 24, color: 'var(--text3)', fontSize: 13 }}>
                  No pending requests.
                </div>
              ) : (
                <div style={{ padding: '0 16px' }}>
                  {pendingRequests.map(r => (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{r.studentName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                          {new Date(r.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {r.timeSlot}
                        </div>
                      </div>
                      <button className="btn btn-primary btn-sm" style={{ fontSize: 12 }} onClick={() => respondToRequest(r.id, 'accepted')}>
                        Accept
                      </button>
                      <button className="btn btn-secondary btn-sm" style={{ fontSize: 12, color: 'var(--red)' }} onClick={() => respondToRequest(r.id, 'declined')}>
                        Decline
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Availability grid */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Your Availability — Click a slot to toggle
              </div>
              <div style={{ padding: 16, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '6px 10px' }}></th>
                      {weekdays.map((d, i) => (
                        <th key={i} style={{ textAlign: 'center', padding: '6px 10px', fontSize: 12, color: 'var(--text2)' }}>
                          {d.toLocaleDateString('en-US', { weekday: 'short' })}
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TIMES.map(t => (
                      <tr key={t}>
                        <td style={{ fontSize: 12, color: 'var(--text3)', padding: '6px 10px', whiteSpace: 'nowrap' }}>{t}</td>
                        {weekdays.map((d, i) => {
                          const req = requestFor(d, t);
                          const available = isAvailable(d, t);

                          let bg = 'var(--surface2)';
                          let color = 'var(--text3)';
                          let label = '—';
                          let clickable = true;

                          if (req?.status === 'accepted') {
                            bg = 'var(--blue-dim)'; color = 'var(--blue)'; label = req.studentName.split(' ')[0]; clickable = false;
                          } else if (req?.status === 'pending') {
                            bg = 'rgba(249,199,79,0.12)'; color = 'var(--yellow)'; label = 'Pending'; clickable = false;
                          } else if (available) {
                            bg = 'var(--gr-dim)'; color = 'var(--gr)'; label = 'Open';
                          }

                          return (
                            <td key={i} style={{ padding: 4, textAlign: 'center' }}>
                              <button
                                disabled={!clickable}
                                onClick={() => clickable && toggleAvailability(d, t)}
                                style={{
                                  width: '100%', padding: '8px 4px', borderRadius: 6,
                                  background: bg, color, fontSize: 11, fontWeight: 600,
                                  border: 'none', cursor: clickable ? 'pointer' : 'default',
                                }}
                              >
                                {label}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '0 16px 16px', fontSize: 11, color: 'var(--text3)' }}>
                Green = open for booking · Yellow = pending request · Blue = accepted meeting · Grey = not available
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
