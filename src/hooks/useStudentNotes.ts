import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface StudentNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

function mapRow(r: any): StudentNote {
  return { id: r.id, title: r.title, content: r.content, createdAt: r.created_at, updatedAt: r.updated_at };
}

export function useStudentNotes(studentId: string | null) {
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('student_notes')
      .select('*')
      .eq('student_id', studentId)
      .order('updated_at', { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setNotes((data ?? []).map(mapRow));
    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  async function createNote(): Promise<{ note: StudentNote | null; error: string | null }> {
    if (!studentId) return { note: null, error: 'Not signed in.' };

    const { data, error } = await supabase
      .from('student_notes')
      .insert({ student_id: studentId, title: 'Untitled Note', content: '' })
      .select('*')
      .single();

    if (error || !data) return { note: null, error: error?.message ?? 'Failed to create note.' };

    const note = mapRow(data);
    setNotes(prev => [note, ...prev]);
    return { note, error: null };
  }

  async function saveNote(id: string, fields: { title: string; content: string }): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('student_notes')
      .update({ title: fields.title, content: fields.content, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) return { error: error.message };

    setNotes(prev =>
      prev
        .map(n => (n.id === id ? { ...n, ...fields, updatedAt: new Date().toISOString() } : n))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    );
    return { error: null };
  }

  async function deleteNote(id: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from('student_notes').delete().eq('id', id);
    if (error) return { error: error.message };

    setNotes(prev => prev.filter(n => n.id !== id));
    return { error: null };
  }

  return { notes, loading, error, createNote, saveNote, deleteNote };
}
