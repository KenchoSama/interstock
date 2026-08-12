import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface MentorRequest {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  timeSlot: string;
  status: 'pending' | 'accepted' | 'declined';
}

export function useMentorSchedule(mentorId: string | undefined, dates: Date[], timeSlots: string[]) {
  const [availability, setAvailability] = useState<Map<string, boolean>>(new Map());
  const [requests, setRequests] = useState<MentorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchSchedule() {
    if (!mentorId || dates.length === 0) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const dateStrs = dates.map(d => d.toISOString().slice(0, 10));

    const [availRes, reqRes] = await Promise.all([
      supabase
        .from('mentor_availability')
        .select('date, time_slot, is_available')
        .eq('mentor_id', mentorId)
        .in('date', dateStrs),
      supabase
        .from('mentor_booking_requests')
        .select('id, student_id, date, time_slot, status, profiles ( full_name )')
        .eq('mentor_id', mentorId)
        .in('date', dateStrs),
    ]);

    if (availRes.error || reqRes.error) {
      setError(availRes.error?.message ?? reqRes.error?.message ?? 'Failed to load schedule');
      setLoading(false);
      return;
    }

    const availMap = new Map<string, boolean>();
    for (const row of availRes.data ?? []) {
      availMap.set(`${row.date}|${row.time_slot}`, row.is_available);
    }
    setAvailability(availMap);

    const reqRows: MentorRequest[] = (reqRes.data ?? []).map((r: any) => ({
      id: r.id,
      studentId: r.student_id,
      studentName: r.profiles?.full_name ?? 'Unknown student',
      date: r.date,
      timeSlot: r.time_slot,
      status: r.status,
    }));
    setRequests(reqRows);

    setLoading(false);
  }

  useEffect(() => {
    fetchSchedule();
  }, [mentorId, dates.map(d => d.toISOString().slice(0, 10)).join(','), timeSlots.join(',')]);

  function isAvailable(date: Date, timeSlot: string): boolean {
    return availability.get(`${date.toISOString().slice(0, 10)}|${timeSlot}`) ?? false;
  }

  function requestFor(date: Date, timeSlot: string): MentorRequest | undefined {
    const dateStr = date.toISOString().slice(0, 10);
    return requests.find(r => r.date === dateStr && r.timeSlot === timeSlot && r.status !== 'declined');
  }

  async function toggleAvailability(date: Date, timeSlot: string) {
    if (!mentorId) return;
    const dateStr = date.toISOString().slice(0, 10);
    const current = availability.get(`${dateStr}|${timeSlot}`) ?? false;

    await supabase.from('mentor_availability').upsert(
      { mentor_id: mentorId, date: dateStr, time_slot: timeSlot, is_available: !current },
      { onConflict: 'mentor_id,date,time_slot' }
    );
    await fetchSchedule();
  }

  async function respondToRequest(requestId: string, status: 'accepted' | 'declined') {
    await supabase.from('mentor_booking_requests').update({ status }).eq('id', requestId);
    await fetchSchedule();
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return { isAvailable, requestFor, toggleAvailability, respondToRequest, pendingRequests, loading, error };
}