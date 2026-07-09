import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface Conversation {
  userId: string;
  name: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
}

export function useMessages(userId?: string | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    async function fetchConversations() {
      const { data } = await supabase
        .from('messages')
        .select('id, sender_id, receiver_id, content, read, created_at')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (!data) { setLoading(false); return; }

      // Group by conversation partner
      const convMap = new Map<string, Conversation>();
      for (const msg of data) {
        const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
        if (!convMap.has(partnerId)) {
          convMap.set(partnerId, {
            userId: partnerId,
            name: partnerId, // will be resolved below
            lastMessage: msg.content,
            lastTime: msg.created_at,
            unread: (!msg.read && msg.receiver_id === userId) ? 1 : 0,
          });
        } else {
          const conv = convMap.get(partnerId)!;
          if (!msg.read && msg.receiver_id === userId) conv.unread++;
        }
      }

      // Resolve names from profiles
      const partnerIds = [...convMap.keys()];
      if (partnerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', partnerIds);

        (profiles ?? []).forEach(p => {
          const conv = convMap.get(p.id);
          if (conv) conv.name = p.full_name ?? 'Student';
        });
      }

      setConversations([...convMap.values()]);
      setLoading(false);
    }

    fetchConversations();
  }, [userId]);

  const openConversation = useCallback(async (partnerId: string) => {
    if (!userId) return;
    setActiveConv(partnerId);

    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true });

    setMessages(data ?? []);

    // Mark as read
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('sender_id', partnerId)
      .eq('receiver_id', userId)
      .eq('read', false);
  }, [userId]);

  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    if (!userId || !content.trim()) return;

    const { data } = await supabase
      .from('messages')
      .insert({ sender_id: userId, receiver_id: receiverId, content: content.trim() })
      .select()
      .single();

    if (data) {
      setMessages(prev => [...prev, data]);
    }
  }, [userId]);

  return { conversations, messages, activeConv, loading, openConversation, sendMessage };
}
