import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface AssignmentRow {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  created_by: string | null;
  created_at: string;
  // joined from submissions
  submission_id: string | null;
  status: 'pending' | 'submitted' | 'graded';
  grade: number | null;
  submitted_at: string | null;
}

export function useAssignments(userId?: string | null, schoolId?: string | null) {
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    async function fetch() {
      // Fetch all assignments for the school
      const { data: assigns } = await supabase
        .from('assignments')
        .select('id, title, description, due_date, created_by, created_at')
        .order('due_date', { ascending: true });

      if (!assigns) { setLoading(false); return; }

      // Fetch student's submissions
      const { data: subs } = await supabase
        .from('submissions')
        .select('id, assignment_id, status, grade, submitted_at')
        .eq('user_id', userId);

      const subMap = new Map((subs ?? []).map(s => [s.assignment_id, s]));

      const rows: AssignmentRow[] = assigns.map(a => {
        const sub = subMap.get(a.id);
        return {
          id: a.id,
          title: a.title,
          description: a.description,
          due_date: a.due_date,
          created_by: a.created_by,
          created_at: a.created_at,
          submission_id: sub?.id ?? null,
          status: (sub?.status as 'pending' | 'submitted' | 'graded') ?? 'pending',
          grade: sub?.grade ?? null,
          submitted_at: sub?.submitted_at ?? null,
        };
      });

      setAssignments(rows);
      setLoading(false);
    }

    fetch();
  }, [userId, schoolId]);

  const submitAssignment = useCallback(async (assignmentId: string, userId: string) => {
    const { data } = await supabase
      .from('submissions')
      .insert({
        assignment_id: assignmentId,
        user_id: userId,
        status: 'submitted',
      })
      .select()
      .single();

    if (data) {
      setAssignments(prev => prev.map(a =>
        a.id === assignmentId
          ? { ...a, submission_id: data.id, status: 'submitted', submitted_at: data.submitted_at }
          : a
      ));
    }
  }, []);

  return { assignments, loading, submitAssignment };
}
