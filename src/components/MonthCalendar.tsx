import { useMemo, useState } from 'react';
import type { CalendarEvent, CalendarEventType } from '../hooks/useCalendarEvents';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const EVENT_STYLE: Record<CalendarEventType, { color: string; label: string }> = {
  competition: { color: 'var(--yellow)', label: 'Competition' },
  mentor: { color: 'var(--blue)', label: 'Mentor Meeting' },
  assignment: { color: 'var(--red)', label: 'Assignment Due' },
};

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function MonthCalendar({ events, loading }: { events: CalendarEvent[]; loading: boolean }) {
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      const list = map.get(ev.date) ?? [];
      list.push(ev);
      map.set(ev.date, list);
    }
    return map;
  }, [events]);

  const todayKey = toDateKey(new Date());

  const cells = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leading = firstDay.getDay();

    const items: { date: Date | null; key: string | null }[] = [];
    for (let i = 0; i < leading; i++) items.push({ date: null, key: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      items.push({ date, key: toDateKey(date) });
    }
    while (items.length % 7 !== 0) items.push({ date: null, key: null });
    return items;
  }, [viewMonth]);

  const monthLabel = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const upcoming = useMemo(() => {
    const now = toDateKey(new Date());
    return [...events]
      .filter(e => e.date >= now)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 6);
  }, [events]);

  const selectedEvents = selectedDay ? eventsByDay.get(selectedDay) ?? [] : [];

  function shiftMonth(delta: number) {
    setViewMonth(prev => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + delta);
      return next;
    });
    setSelectedDay(null);
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div className="card-title" style={{ margin: 0 }}>CALENDAR</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" style={{ padding: '2px 9px' }} onClick={() => shiftMonth(-1)}>‹</button>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', minWidth: 130, textAlign: 'center' }}>{monthLabel}</span>
          <button className="btn btn-secondary btn-sm" style={{ padding: '2px 9px' }} onClick={() => shiftMonth(1)}>›</button>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 12, flexWrap: 'wrap' }}>
        {(Object.keys(EVENT_STYLE) as CalendarEventType[]).map(type => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text3)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: EVENT_STYLE[type].color, flexShrink: 0 }} />
            {EVENT_STYLE[type].label}
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px 0', fontSize: 13, color: 'var(--text3)' }}>
          Loading calendar…
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {WEEKDAYS.map(w => (
              <div key={w} style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textAlign: 'center', padding: '4px 0', textTransform: 'uppercase' }}>
                {w}
              </div>
            ))}
            {cells.map((cell, i) => {
              if (!cell.date || !cell.key) {
                return <div key={i} />;
              }
              const dayEvents = eventsByDay.get(cell.key) ?? [];
              const isToday = cell.key === todayKey;
              const isSelected = cell.key === selectedDay;

              return (
                <div
                  key={i}
                  onClick={() => dayEvents.length > 0 && setSelectedDay(isSelected ? null : cell.key)}
                  style={{
                    minHeight: 54,
                    borderRadius: 8,
                    padding: '5px 5px 4px',
                    border: `1px solid ${isSelected ? 'var(--gr)' : isToday ? 'rgba(0,230,118,0.35)' : 'var(--border)'}`,
                    background: isSelected ? 'var(--gr-dim)' : 'var(--surface2)',
                    cursor: dayEvents.length > 0 ? 'pointer' : 'default',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: isToday ? 700 : 400, color: isToday ? 'var(--gr)' : 'var(--text2)', marginBottom: 4 }}>
                    {cell.date.getDate()}
                  </div>
                  <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    {dayEvents.slice(0, 4).map(ev => (
                      <span
                        key={ev.id}
                        title={ev.title}
                        style={{ width: 6, height: 6, borderRadius: '50%', background: EVENT_STYLE[ev.type].color }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected day / upcoming list */}
          <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>
              {selectedDay
                ? new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                : 'Upcoming'}
            </div>

            {(selectedDay ? selectedEvents : upcoming).length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                {selectedDay ? 'No events this day.' : 'Nothing coming up.'}
              </div>
            )}

            {(selectedDay ? selectedEvents : upcoming).map(ev => (
              <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: EVENT_STYLE[ev.type].color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--text)', flex: 1 }}>{ev.title}</span>
                {!selectedDay && (
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                    {new Date(ev.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
