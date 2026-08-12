import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type SlotStatus = 'available' | 'unavailable' | 'booked';

export function useMentorAvailability(mentorId: string | undefined, dates: Date[], timeSlots: string[]) {
  const [statusMap, setStatusMap] = useState<Map<string, SlotStatus>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mentorId || dates.length === 0) {
      setLoading(false);
      return;
    }

    async function fetchAvailability() {
      setLoading(true);
      const dateStrs = dates.map(d => d.toISOString().slice(0, 10));

      const [availRes, bookedRes] = await Promise.all([
        supabase
          .from('mentor_availability')
          .select('date, time_slot, is_available')
          .eq('mentor_id', mentorId)
          .in('date', dateStrs),
        supabase
          .from('mentor_booking_requests')
          .select('date, time_slot')
          .eq('mentor_id', mentorId)
          .eq('status', 'accepted')
          .in('date', dateStrs),
      ]);

      const map = new Map<string, SlotStatus>();

      for (const date of dateStrs) {
        for (const slot of timeSlots) {
          map.set(`${date}|${slot}`, 'unavailable');
        }
      }

      for (const row of availRes.data ?? []) {
        if (row.is_available) {
          map.set(`${row.date}|${row.time_slot}`, 'available');
        }
      }

      for (const row of bookedRes.data ?? []) {
        map.set(`${row.date}|${row.time_slot}`, 'booked');
      }

      setStatusMap(map);
      setLoading(false);
    }

    fetchAvailability();
  }, [mentorId, dates.map(d => d.toISOString().slice(0, 10)).join(','), timeSlots.join(',')]);

  function getStatus(date: Date, timeSlot: string): SlotStatus {
    const key = `${date.toISOString().slice(0, 10)}|${timeSlot}`;
    return statusMap.get(key) ?? 'unavailable';
  }

  return { getStatus, loading };
}