import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface AnnouncementRow {
  id: string;
  title: string;
  body: string;
  created_at: string;
  read: boolean;
}

export function useAnnouncements(userId?: string | null) {
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);

    const [announceRes, readsRes] = await Promise.all([
      supabase
        .from('announcements')
        .select('id, title, body, created_at')
        .order('created_at', { ascending: false }),
      supabase.from('announcement_reads').select('announcement_id').eq('user_id', userId),
    ]);

    const readIds = new Set((readsRes.data ?? []).map(r => r.announcement_id));

    setAnnouncements(
      (announceRes.data ?? []).map(a => ({ ...a, read: readIds.has(a.id) }))
    );
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const markAsRead = useCallback(async (announcementId: string) => {
    if (!userId) return;
    setAnnouncements(prev =>
      prev.map(a => (a.id === announcementId ? { ...a, read: true } : a))
    );
    await supabase
      .from('announcement_reads')
      .upsert({ announcement_id: announcementId, user_id: userId }, { onConflict: 'announcement_id,user_id' });
  }, [userId]);

  return { announcements, loading, markAsRead };
}
