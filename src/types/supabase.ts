export type UserRole = 'student' | 'staff' | 'school_admin' | 'partner' | 'admin';

export interface Profile {
  id: string;
  role: UserRole;
  school_id: string | null;
  full_name: string | null;
  xp: number;
  avatar_url: string | null;
  linkedin_url: string | null;
  bio: string | null;
  created_at: string | null;
}
