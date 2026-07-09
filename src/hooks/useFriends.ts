import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface FriendRequest {
  id: string;
  sender_id: string;
  sender_name: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

export interface Friend {
  id: string;
  name: string;
  xp: number;
  return_pct: number;
}

export function useFriends(userId?: string | null) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    async function fetchAll() {
      // Fetch accepted friends
      const { data: friendRows } = await supabase
        .from('friends')
        .select('friend_id')
        .eq('user_id', userId);

      console.log('friendRows:', friendRows);

      if (friendRows && friendRows.length > 0) {
        const ids = friendRows.map(f => f.friend_id);

        console.log('fetching profiles for ids:', ids);

        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, xp')
          .in('id', ids);

        console.log('profiles:', profiles, 'error:', profileError);

        setFriends((profiles ?? []).map(p => ({
          id: p.id,
          name: p.full_name ?? 'Student',
          xp: p.xp ?? 0,
          return_pct: 0,
        })));
      }

      // Fetch incoming pending requests
      const { data: requests } = await supabase
        .from('friend_requests')
        .select('id, sender_id, status, created_at')
        .eq('receiver_id', userId)
        .eq('status', 'pending');

      // Fetch sender names separately
      const senderIds = (requests ?? []).map(r => r.sender_id);
      let nameMap: Record<string, string> = {};

      if (senderIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', senderIds);

        (profiles ?? []).forEach(p => {
          nameMap[p.id] = p.full_name ?? 'Student';
        });
      }

      setIncoming((requests ?? []).map(r => ({
        id: r.id,
        sender_id: r.sender_id,
        sender_name: nameMap[r.sender_id] ?? 'Student',
        status: r.status,
        created_at: r.created_at,
      })));

      // Fetch requests already sent by this user
      const { data: sent } = await supabase
        .from('friend_requests')
        .select('receiver_id')
        .eq('sender_id', userId)
        .eq('status', 'pending');

      setSentIds(new Set((sent ?? []).map(r => r.receiver_id)));

      setLoading(false);
    }

    fetchAll();

    // Subscribe to new incoming friend requests in real time
    const channel = supabase
      .channel(`friend-requests-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'friend_requests',
        filter: `receiver_id=eq.${userId}`,
      }, async (payload) => {
        // Fetch sender's name
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', payload.new.sender_id)
          .single();

        const newRequest: FriendRequest = {
          id: payload.new.id,
          sender_id: payload.new.sender_id,
          sender_name: profile?.full_name ?? 'Unknown Student',
          status: 'pending',
          created_at: payload.new.created_at,
        };

        setIncoming(prev => [...prev, newRequest]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, refreshKey]);

  const sendRequest = useCallback(async (receiverId: string) => {
    if (!userId) return;

    const { error } = await supabase
      .from('friend_requests')
      .insert({
        sender_id: userId,
        receiver_id: receiverId,
        status: 'pending',
      });

    if (error?.code === '23505') {
      // Already sent — just update UI to show Requested
      console.log('Request already exists');
    }
  }, [userId]);

  const respondToRequest = useCallback(async (requestId: string, accept: boolean, senderId: string) => {
    if (!userId) return;

    await supabase
      .from('friend_requests')
      .update({ status: accept ? 'accepted' : 'declined' })
      .eq('id', requestId);

    if (accept) {
      // Create mutual friendship
      await supabase.from('friends').insert([
        { user_id: userId, friend_id: senderId },
        { user_id: senderId, friend_id: userId },
      ]);

      // Fetch the new friend's profile and add to friends list
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, xp')
        .eq('id', senderId)
        .single();

      const { data: lbEntry } = await supabase
        .from('leaderboard')
        .select('return_pct')
        .eq('id', senderId)
        .maybeSingle();

      if (profile) {
        setFriends(prev => [...prev, {
          id: profile.id,
          name: profile.full_name ?? 'Student',
          xp: profile.xp ?? 0,
          return_pct: lbEntry?.return_pct ?? 0,
        }]);
      }

      setIncoming(prev => prev.filter(r => r.id !== requestId));
    } else {
      setIncoming(prev => prev.filter(r => r.id !== requestId));
    }
  }, [userId]);

  const removeFriend = useCallback(async (friendId: string) => {
    if (!userId) return;

    // Delete both sides of the friendship
    await supabase
      .from('friends')
      .delete()
      .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);

    setFriends(prev => prev.filter(f => f.id !== friendId));
  }, [userId]);

  return { friends, incoming, sentIds, loading, sendRequest, respondToRequest, removeFriend };
}
