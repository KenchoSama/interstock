import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface AssignmentRow {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  created_by: string | null;
  created_at: string;
  file_url: string | null;
  xp_reward: number;
  // joined from submissions
  submission_id: string | null;
  status: 'pending' | 'submitted' | 'graded';
  grade: number | null;
  submitted_at: string | null;
  submission_file_url: string | null;
}

const MAX_FILE_BYTES = 15 * 1024 * 1024;

export function useAssignments(userId?: string | null, schoolId?: string | null) {
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    async function fetch() {
      // Fetch all assignments for the school
      const { data: assigns } = await supabase
        .from('assignments')
        .select('id, title, description, due_date, created_by, created_at, xp_reward, file_url')
        .order('due_date', { ascending: true });

      if (!assigns) { setLoading(false); return; }

      // Fetch student's submissions
      const { data: subs } = await supabase
        .from('submissions')
        .select('id, assignment_id, status, grade, submitted_at, file_url')
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
          file_url: a.file_url,
          xp_reward: a.xp_reward,
          submission_id: sub?.id ?? null,
          status: (sub?.status as 'pending' | 'submitted' | 'graded') ?? 'pending',
          grade: sub?.grade ?? null,
          submitted_at: sub?.submitted_at ?? null,
          submission_file_url: sub?.file_url ?? null,
        };
      });

      setAssignments(rows);
      setLoading(false);
    }

    fetch();
  }, [userId, schoolId]);

  const submitAssignment = useCallback(async (
    assignmentId: string,
    userId: string,
    file: File | null
  ): Promise<{ error: string | null }> => {
    if (file && file.size > MAX_FILE_BYTES) {
      return { error: 'File must be smaller than 15MB.' };
    }

    const { data, error } = await supabase
      .from('submissions')
      .insert({
        assignment_id: assignmentId,
        user_id: userId,
        status: 'submitted',
      })
      .select()
      .single();

    if (error || !data) {
      return { error: error?.message ?? 'Failed to submit assignment.' };
    }

    let fileUrl: string | null = null;
    if (file) {
      const path = `${assignmentId}/${userId}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('submissions')
        .upload(path, file, { upsert: true });

      if (uploadError) {
        return { error: `Submitted, but the file failed to upload: ${uploadError.message}` };
      }

      const { data: publicUrl } = supabase.storage.from('submissions').getPublicUrl(path);
      fileUrl = publicUrl.publicUrl;
      await supabase.from('submissions').update({ file_url: fileUrl }).eq('id', data.id);
    }

    setAssignments(prev => prev.map(a =>
      a.id === assignmentId
        ? { ...a, submission_id: data.id, status: 'submitted', submitted_at: data.submitted_at, submission_file_url: fileUrl }
        : a
    ));

    return { error: null };
  }, []);

  return { assignments, loading, submitAssignment };
}
