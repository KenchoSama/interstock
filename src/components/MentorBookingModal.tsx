import { useState } from 'react';
import type { Mentor } from '../hooks/useMentor';

interface Props {
  mentor: Mentor;
  onClose: () => void;
}

const TIMES = ['9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','2:00 PM','2:30 PM','3:00 PM','3:30 PM'];

function getWeekdays(count = 5) {
  const days: Date[] = [];
  const d = new Date();
  while (days.length < count) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) days.push(new Date(d));
  }
  return days;
}

export default function MentorBookingModal({ mentor, onClose }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const weekdays = getWeekdays();
  const initials = mentor.name.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>← Back</button>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Book Meeting with {mentor.name}</span>
        </div>

        {/* Mentor info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface2)', borderRadius: 8, padding: '12px 14px', marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gr-dim)', border: '2px solid var(--gr)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: 'var(--gr)', flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{mentor.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>{mentor.title} · {mentor.company}</div>
          </div>
        </div>

        {!confirmed ? (
          <>
            {/* Date selection */}
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Select Date</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {weekdays.map((d, i) => (
                <button key={i}
                  onClick={() => { setSelectedDate(d); setSelectedTime(null); }}
                  style={{
                    flex: 1, border: `1.5px solid ${selectedDate?.toDateString() === d.toDateString() ? 'var(--gr)' : 'var(--border)'}`,
                    background: selectedDate?.toDateString() === d.toDateString() ? 'var(--gr-dim)' : 'var(--surface)',
                    borderRadius: 8, padding: '10px 4px', cursor: 'pointer', textAlign: 'center',
                  }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: selectedDate?.toDateString() === d.toDateString() ? 'var(--gr)' : 'var(--text)' }}>{d.toLocaleDateString('en-US', { month: 'short' })}</div>
                  <div style={{ fontSize: 13, color: 'var(--text3)' }}>{d.getDate()}</div>
                </button>
              ))}
            </div>

            {/* Time selection */}
            {selectedDate ? (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Select Time</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
                  {TIMES.map(t => (
                    <button key={t} onClick={() => setSelectedTime(t)}
                      style={{
                        border: `1.5px solid ${selectedTime === t ? 'var(--gr)' : 'var(--border)'}`,
                        background: selectedTime === t ? 'var(--gr-dim)' : 'var(--surface)',
                        borderRadius: 8, padding: '8px 4px', cursor: 'pointer',
                        fontSize: 13, fontWeight: selectedTime === t ? 600 : 400,
                        color: selectedTime === t ? 'var(--gr)' : 'var(--text)',
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: 14, textAlign: 'center', fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>
                Select a date above to see available times.
              </div>
            )}

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: 11, fontSize: 14, opacity: selectedDate && selectedTime ? 1 : 0.4 }}
              disabled={!selectedDate || !selectedTime}
              onClick={() => setConfirmed(true)}
            >
              Confirm Booking
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Meeting Booked!</div>
            <div style={{ fontSize: 13, color: 'var(--text3)' }}>
              {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime} with {mentor.name}
            </div>
            <button className="btn btn-secondary" style={{ marginTop: 20 }} onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}
