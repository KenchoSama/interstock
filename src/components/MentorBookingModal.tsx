import { useState } from 'react';
import type { Mentor } from '../hooks/useMentor';
import { useMentorAvailability } from '../hooks/Usementoravailability';
import { supabase } from '../lib/supabase';
import { useApp } from '../state/AppContext';

interface Props {
  mentor: Mentor;
  onClose: () => void;
}

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

export default function MentorBookingModal({ mentor, onClose }: Props) {
  const { state } = useApp();
  const user = state.u[state.role];

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const weekdays = getWeekdays();
  const { getStatus, loading: availabilityLoading } = useMentorAvailability(mentor.id, weekdays, TIMES);
  const initials = mentor.name.split(' ').map(n => n[0]).join('').slice(0, 2);

  async function handleConfirm() {
    if (!selectedDate || !selectedTime || !user.supabaseId) return;
    setSubmitting(true);
    setError(null);

    const { error } = await supabase.from('mentor_booking_requests').insert({
      student_id: user.supabaseId,
      mentor_id: mentor.id,
      date: selectedDate.toISOString().slice(0, 10),
      time_slot: selectedTime,
    });

    setSubmitting(false);
    if (error) {
      setError('Could not send your request. Please try again.');
      return;
    }
    setConfirmed(true);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>← Back</button>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Request a Meeting with {mentor.name}</span>
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

            {/* Time selection - only real availability is clickable */}
            {selectedDate ? (
              availabilityLoading ? (
                <div style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', padding: '10px 0', marginBottom: 20 }}>
                  Checking availability...
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Select Time</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                    {TIMES.map(t => {
                      const status = getStatus(selectedDate, t);
                      const isBookable = status === 'available';
                      const isSelected = selectedTime === t;
                      return (
                        <button key={t}
                          disabled={!isBookable}
                          onClick={() => isBookable && setSelectedTime(t)}
                          style={{
                            border: `1.5px solid ${isSelected ? 'var(--gr)' : 'var(--border)'}`,
                            background: isSelected ? 'var(--gr-dim)' : isBookable ? 'var(--surface)' : 'var(--surface2)',
                            borderRadius: 8, padding: '8px 4px',
                            cursor: isBookable ? 'pointer' : 'not-allowed',
                            fontSize: 13, fontWeight: isSelected ? 600 : 400,
                            color: isSelected ? 'var(--gr)' : isBookable ? 'var(--text)' : 'var(--text3)',
                            opacity: isBookable ? 1 : 0.5,
                            textDecoration: status === 'booked' ? 'line-through' : undefined,
                          }}>
                          {t}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 20 }}>
                    Greyed-out times are unavailable or already booked.
                  </div>
                </>
              )
            ) : (
              <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: 14, textAlign: 'center', fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>
                Select a date above to see available times.
              </div>
            )}

            {error && (
              <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>{error}</div>
            )}

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: 11, fontSize: 14, opacity: selectedDate && selectedTime && !submitting ? 1 : 0.4 }}
              disabled={!selectedDate || !selectedTime || submitting}
              onClick={handleConfirm}
            >
              {submitting ? 'Sending Request...' : 'Send Request'}
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Request Sent!</div>
            <div style={{ fontSize: 13, color: 'var(--text3)' }}>
              {mentor.name} will need to accept your request for{' '}
              {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime}.
              You'll be notified once they respond.
            </div>
            <button className="btn btn-secondary" style={{ marginTop: 20 }} onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}
