import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface AdminAnnouncementRow {
  id: string;
  title: string;
  body: string;
  created_at: string;
  schoolNames: string[] | null; // null = sent to all schools
}

export interface SchoolOption {
  id: string;
  name: string;
  studentCount: number;
}

export function useAdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<AdminAnnouncementRow[]>([]);
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [announceRes, schoolsRes, studentsRes, announceSchoolsRes] = await Promise.all([
      supabase
        .from('announcements')
        .select('id, title, body, created_at')
        .order('created_at', { ascending: false }),
      supabase.from('schools').select('id, name').order('name'),
      supabase.from('profiles').select('school_id').eq('role', 'student'),
      supabase.from('announcement_schools').select('announcement_id, school_id'),
    ]);

    if (announceRes.error) {
      setError(announceRes.error.message);
      setLoading(false);
      return;
    }

    const studentCountBySchool = new Map<string, number>();
    for (const s of studentsRes.data ?? []) {
      if (!s.school_id) continue;
      studentCountBySchool.set(s.school_id, (studentCountBySchool.get(s.school_id) ?? 0) + 1);
    }

    const schoolNameById = new Map((schoolsRes.data ?? []).map(s => [s.id, s.name]));

    const schoolsByAnnouncement = new Map<string, string[]>();
    for (const row of announceSchoolsRes.data ?? []) {
      const list = schoolsByAnnouncement.get(row.announcement_id) ?? [];
      list.push(schoolNameById.get(row.school_id) ?? 'Unknown school');
      schoolsByAnnouncement.set(row.announcement_id, list);
    }

    setAnnouncements(
      (announceRes.data ?? []).map(a => ({
        ...a,
        schoolNames: schoolsByAnnouncement.get(a.id) ?? null,
      }))
    );
    setSchools(
      (schoolsRes.data ?? []).map(s => ({ id: s.id, name: s.name, studentCount: studentCountBySchool.get(s.id) ?? 0 }))
    );
    setTotalStudents(studentsRes.data?.length ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  async function createAnnouncement(input: {
    title: string;
    body: string;
    createdBy: string | null;
    schoolIds: string[]; // empty = all schools
  }): Promise<{ error: string | null }> {
    const title = input.title.trim();
    const body = input.body.trim();
    if (!title) return { error: 'Announcement title is required.' };
    if (!body) return { error: 'Announcement body is required.' };

    const { data: inserted, error: insertError } = await supabase
      .from('announcements')
      .insert({ title, body, created_by: input.createdBy })
      .select('id')
      .single();

    if (insertError || !inserted) {
      return { error: insertError?.message ?? 'Failed to create announcement.' };
    }

    if (input.schoolIds.length > 0) {
      const { error: schoolsError } = await supabase
        .from('announcement_schools')
        .insert(input.schoolIds.map(schoolId => ({ announcement_id: inserted.id, school_id: schoolId })));

      if (schoolsError) {
        return { error: `Announcement created, but school targeting failed: ${schoolsError.message}` };
      }
    }

    await fetchAnnouncements();
    return { error: null };
  }

  async function deleteAnnouncement(id: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) return { error: error.message };
    await fetchAnnouncements();
    return { error: null };
  }

  return { announcements, schools, totalStudents, loading, error, createAnnouncement, deleteAnnouncement, refetch: fetchAnnouncements };
}
