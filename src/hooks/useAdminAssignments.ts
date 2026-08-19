import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface AdminAssignmentRow {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  file_url: string | null;
  created_at: string;
  submissionCount: number;
}

const MAX_FILE_BYTES = 15 * 1024 * 1024;

export function useAdminAssignments() {
  const [assignments, setAssignments] = useState<AdminAssignmentRow[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [assignsRes, subsRes, studentsRes] = await Promise.all([
      supabase
        .from('assignments')
        .select('id, title, description, due_date, file_url, created_at')
        .order('created_at', { ascending: false }),
      supabase.from('submissions').select('assignment_id'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
    ]);

    if (assignsRes.error) {
      setError(assignsRes.error.message);
      setLoading(false);
      return;
    }

    const countByAssignment = new Map<string, number>();
    for (const s of subsRes.data ?? []) {
      if (!s.assignment_id) continue;
      countByAssignment.set(s.assignment_id, (countByAssignment.get(s.assignment_id) ?? 0) + 1);
    }

    setAssignments(
      (assignsRes.data ?? []).map(a => ({
        ...a,
        submissionCount: countByAssignment.get(a.id) ?? 0,
      }))
    );
    setTotalStudents(studentsRes.count ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  async function createAssignment(input: {
    title: string;
    description: string;
    dueDate: string;
    file: File | null;
    createdBy: string | null;
  }): Promise<{ error: string | null }> {
    const title = input.title.trim();
    if (!title) return { error: 'Assignment title is required.' };

    if (input.file) {
      if (input.file.type !== 'application/pdf') {
        return { error: 'Only PDF files are supported.' };
      }
      if (input.file.size > MAX_FILE_BYTES) {
        return { error: 'PDF must be smaller than 15MB.' };
      }
    }

    const { data: inserted, error: insertError } = await supabase
      .from('assignments')
      .insert({
        title,
        description: input.description.trim() || null,
        due_date: input.dueDate || null,
        created_by: input.createdBy,
        school_id: null,
      })
      .select('id')
      .single();

    if (insertError || !inserted) {
      return { error: insertError?.message ?? 'Failed to create assignment.' };
    }

    if (input.file) {
      const path = `${inserted.id}/${input.file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('assignments')
        .upload(path, input.file, { upsert: true });

      if (uploadError) {
        return { error: `Assignment created, but the file failed to upload: ${uploadError.message}` };
      }

      const { data: publicUrl } = supabase.storage.from('assignments').getPublicUrl(path);
      await supabase.from('assignments').update({ file_url: publicUrl.publicUrl }).eq('id', inserted.id);
    }

    await fetchAssignments();
    return { error: null };
  }

  async function deleteAssignment(id: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from('assignments').delete().eq('id', id);
    if (error) return { error: error.message };
    await fetchAssignments();
    return { error: null };
  }

  return { assignments, totalStudents, loading, error, createAssignment, deleteAssignment, refetch: fetchAssignments };
}
