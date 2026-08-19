import { supabase } from './supabase';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.');
  }
  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error('Image must be smaller than 5MB.');
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, cacheControl: '3600' });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId);

  if (updateError) throw updateError;

  return avatarUrl;
}

export async function updateProfileDetails(
  userId: string,
  details: { bio?: string | null; linkedin_url?: string | null }
): Promise<void> {
  const { error } = await supabase.from('profiles').update(details).eq('id', userId);
  if (error) throw error;
}
