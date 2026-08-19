import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type CalendarEventType = 'competition' | 'mentor' | 'assignment';

export interface CalendarEvent {
  id: string;
  type: CalendarEventType;
  title: string;
  date: string; // YYYY-MM-DD, local to the event's stored date
}

export function useCalendarEvents(userId?: string | null) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchEvents() {
      setLoading(true);

      const [compsRes, mentorRes, assignsRes] = await Promise.all([
        supabase.from('competitions').select('id, name, deadline'),
        supabase
          .from('mentor_booking_requests')
          .select('id, date, time_slot, status, profiles!mentor_booking_requests_mentor_id_fkey ( full_name )')
          .eq('student_id', userId)
          .neq('status', 'declined'),
        supabase.from('assignments').select('id, title, due_date'),
      ]);

      const items: CalendarEvent[] = [];

      for (const c of compsRes.data ?? []) {
        if (!c.deadline) continue;
        items.push({ id: `comp-${c.id}`, type: 'competition', title: c.name, date: c.deadline.slice(0, 10) });
      }

      for (const r of mentorRes.data ?? []) {
        const mentorName = (r as any).profiles?.full_name ?? 'Mentor';
        const label = r.status === 'pending' ? `${mentorName} (pending)` : mentorName;
        items.push({ id: `mentor-${r.id}`, type: 'mentor', title: `${label} · ${r.time_slot}`, date: r.date });
      }

      for (const a of assignsRes.data ?? []) {
        if (!a.due_date) continue;
        items.push({ id: `assign-${a.id}`, type: 'assignment', title: a.title, date: a.due_date.slice(0, 10) });
      }

      setEvents(items);
      setLoading(false);
    }

    fetchEvents();
  }, [userId]);

  return { events, loading };
}
