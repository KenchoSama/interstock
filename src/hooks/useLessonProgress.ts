import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useLessonProgress(studentId?: string | null) {
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }

    async function fetch() {
      const { data } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('student_id', studentId);

      if (data) {
        setCompletedIds(new Set(data.map(r => r.lesson_id)));
      }
      setLoading(false);
    }

    fetch();
  }, [studentId]);

  const completeLesson = useCallback(async (lessonId: number, xp: number, onXpAdd: (amount: number) => void) => {
    if (completedIds.has(lessonId)) return;

    setCompletedIds(prev => new Set([...prev, lessonId]));
    onXpAdd(xp);

    await supabase.from('lesson_progress').insert({
      student_id: studentId,
      lesson_id: lessonId,
    });

    if (studentId) {
      await supabase.rpc('increment_xp', { user_id: studentId, amount: xp });
    }
  }, [completedIds, studentId]);

  return { completedIds, loading, completeLesson };
}
