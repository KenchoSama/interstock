import { supabase } from './supabase';
import type { UserProfile } from '../types';

export interface StudentRow {
  name: string;
  xp: number;
  cash: number;
  achievements: string[];
  portfolio: { sym: string; shares: number; avg: number; price: number }[];
}

export async function fetchStudentData(userId: string, userMeta?: Record<string, string>): Promise<StudentRow | null> {
  const [{ data: profile }, { data: holdings }] = await Promise.all([
    supabase.from('profiles').select('full_name, xp, cash, achievements').eq('id', userId).single(),
    supabase.from('holdings').select('sym, shares, avg, price').eq('user_id', userId),
  ]);

  if (!profile) return null;

  const name = profile.full_name ?? userMeta?.full_name ?? 'Student';

  return {
    name,
    xp:           profile.xp           ?? 0,
    cash:         profile.cash         ?? 100000,
    achievements: profile.achievements ?? [],
    portfolio:    holdings              ?? [],
  };
}

export async function saveStudentData(userId: string, student: UserProfile): Promise<void> {
  await supabase.from('profiles').update({
    full_name:    student.name,
    xp:           student.xp,
    cash:         student.cash,
    achievements: student.achievements,
  }).eq('id', userId);

  // Replace holdings: delete stale rows then upsert current
  await supabase.from('holdings').delete().eq('user_id', userId);

  if (student.portfolio.length > 0) {
    await supabase.from('holdings').insert(
      student.portfolio.map(h => ({
        user_id: userId,
        sym:    h.sym,
        shares: h.shares,
        avg:    h.avg,
        price:  h.price,
      }))
    );
  }
}
