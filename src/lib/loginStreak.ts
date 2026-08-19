import { supabase } from './supabase';

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Call once per session hydration. Increments the streak the first time a
// student is seen on a new calendar day, resets it if a day was missed, and
// is a no-op if they've already been recorded today.
export async function syncLoginStreak(
  userId: string,
  lastActiveDate: string | null,
  currentStreak: number
): Promise<number> {
  const today = toDateKey(new Date());
  if (lastActiveDate === today) return currentStreak;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const wasYesterday = lastActiveDate === toDateKey(yesterday);

  const newStreak = wasYesterday ? currentStreak + 1 : 1;

  await supabase
    .from('profiles')
    .update({ last_active_date: today, login_streak: newStreak })
    .eq('id', userId);

  return newStreak;
}
