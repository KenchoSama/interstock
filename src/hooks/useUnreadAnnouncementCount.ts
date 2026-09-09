import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useUnreadAnnouncementCount(userId?: string | null) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    async function fetch() {
      const [{ count: total }, { data: reads }] = await Promise.all([
        supabase.from('announcements').select('*', { count: 'exact', head: true }),
        supabase.from('announcement_reads').select('announcement_id').eq('user_id', userId),
      ]);
      setCount(Math.max(0, (total ?? 0) - (reads?.length ?? 0)));
    }

    fetch();

    const channel = supabase
      .channel('unread-announcements')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, () => fetch())
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'announcement_reads',
        filter: `user_id=eq.${userId}`,
      }, () => fetch())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  return { count };
}
