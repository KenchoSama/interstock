import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface FeedbackRow {
  id: string;
  studentName: string;
  subject: string;
  description: string;
  createdAt: string;
}

export function useAdminFeedback() {
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('feedback')
      .select('id, subject, description, created_at, profiles!student_id ( full_name )')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setFeedback(
      (data ?? []).map((f: any) => ({
        id: f.id,
        studentName: f.profiles?.full_name ?? 'Unknown student',
        subject: f.subject,
        description: f.description,
        createdAt: f.created_at,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  return { feedback, loading, error, refetch: fetchFeedback };
}
