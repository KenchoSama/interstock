import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../state/AppContext';

export interface FieldTrip {
  id: string;
  category: string;
  icon: string;
  title: string;
  description: string;
  trip_date: string; // ISO date string e.g. "2026-05-03"
  spots: number;
  min_grade: number;
  xp_required: number;
  req_text: string;
  enrolled: number;
  isRegistered: boolean;
}

interface UseFieldTripsResult {
  trips: FieldTrip[];
  loading: boolean;
  error: string | null;
  register: (tripId: string) => Promise<{ error: string | null }>;
  unregister: (tripId: string) => Promise<{ error: string | null }>;
  refetch: () => Promise<void>;
}

export function useFieldTrips(): UseFieldTripsResult {
  const { state } = useApp();
  const userId = state.u[state.role].supabaseId;

  const [trips, setTrips] = useState<FieldTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [tripsRes, spotsRes, regsRes] = await Promise.all([
      supabase.from('field_trips').select('*').order('trip_date', { ascending: true }),
      supabase.from('field_trip_spots_taken').select('*'),
      userId
        ? supabase.from('field_trip_registrations').select('field_trip_id').eq('user_id', userId)
        : Promise.resolve({ data: [] as { field_trip_id: string }[], error: null }),
    ]);

    if (tripsRes.error || spotsRes.error || regsRes.error) {
      setError(
        tripsRes.error?.message ?? spotsRes.error?.message ?? regsRes.error?.message ?? 'Failed to load field trips'
      );
      setLoading(false);
      return;
    }

    const spotsMap = new Map<string, number>(
      (spotsRes.data ?? []).map((s: any) => [s.field_trip_id, s.enrolled])
    );
    const registeredSet = new Set((regsRes.data ?? []).map((r: any) => r.field_trip_id));

    const merged: FieldTrip[] = (tripsRes.data ?? []).map((t: any) => ({
      ...t,
      enrolled: spotsMap.get(t.id) ?? 0,
      isRegistered: registeredSet.has(t.id),
    }));

    setTrips(merged);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const register = useCallback(
    async (tripId: string) => {
      if (!userId) return { error: 'Not logged in' };

      const { error } = await supabase
        .from('field_trip_registrations')
        .insert({ field_trip_id: tripId, user_id: userId });

      if (error) return { error: error.message };

      await fetchTrips();
      return { error: null };
    },
    [userId, fetchTrips]
  );

  const unregister = useCallback(
    async (tripId: string) => {
      if (!userId) return { error: 'Not logged in' };

      const { error } = await supabase
        .from('field_trip_registrations')
        .delete()
        .eq('field_trip_id', tripId)
        .eq('user_id', userId);

      if (error) return { error: error.message };

      await fetchTrips();
      return { error: null };
    },
    [userId, fetchTrips]
  );

  return { trips, loading, error, register, unregister, refetch: fetchTrips };
}
