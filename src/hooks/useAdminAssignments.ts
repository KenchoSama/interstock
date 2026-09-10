import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface AdminAssignmentRow {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  file_url: string | null;
  created_at: string;
  xp_reward: number;
  schoolId: string | null;
  courseLevel: number | null;
  targetStudentCount: number;
  submissionCount: number;
}

export interface SchoolOption {
  id: string;
  name: string;
}

interface StudentForTargeting {
  school_id: string | null;
  course_level: number | null;
}

const MAX_FILE_BYTES = 15 * 1024 * 1024;

export function useAdminAssignments() {
  const [assignments, setAssignments] = useState<AdminAssignmentRow[]>([]);
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [students, setStudents] = useState<StudentForTargeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const countTargeted = useCallback((schoolId: string | null, courseLevel: number | null) => {
    return students.filter(s =>
      (schoolId === null || s.school_id === schoolId) &&
      (courseLevel === null || s.course_level === courseLevel)
    ).length;
  }, [students]);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [assignsRes, subsRes, schoolsRes, studentsRes] = await Promise.all([
      supabase
        .from('assignments')
        .select('id, title, description, due_date, file_url, created_at, xp_reward, school_id, course_level')
        .order('created_at', { ascending: false }),
      supabase.from('submissions').select('assignment_id'),
      supabase.from('schools').select('id, name').order('name'),
      supabase.from('profiles').select('school_id, course_level').eq('role', 'student'),
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

    const studentRows = studentsRes.data ?? [];

    setAssignments(
      (assignsRes.data ?? []).map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        due_date: a.due_date,
        file_url: a.file_url,
        created_at: a.created_at,
        xp_reward: a.xp_reward,
        schoolId: a.school_id,
        courseLevel: a.course_level,
        targetStudentCount: studentRows.filter(s =>
          (a.school_id === null || s.school_id === a.school_id) &&
          (a.course_level === null || s.course_level === a.course_level)
        ).length,
        submissionCount: countByAssignment.get(a.id) ?? 0,
      }))
    );
    setSchools(schoolsRes.data ?? []);
    setStudents(studentRows);
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
    xpReward: number;
    schoolId: string | null;
    courseLevel: number | null;
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
        school_id: input.schoolId,
        course_level: input.courseLevel,
        xp_reward: Math.max(0, input.xpReward),
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

  async function updateXpReward(id: string, xpReward: number): Promise<{ error: string | null }> {
    const { error } = await supabase.from('assignments').update({ xp_reward: Math.max(0, xpReward) }).eq('id', id);
    if (error) return { error: error.message };
    await fetchAssignments();
    return { error: null };
  }

  return {
    assignments,
    schools,
    countTargeted,
    loading,
    error,
    createAssignment,
    deleteAssignment,
    updateXpReward,
    refetch: fetchAssignments,
  };
}
