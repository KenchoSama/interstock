import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useSignupAccessCode() {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCode = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'student_signup_code')
      .maybeSingle();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setCode(data?.value ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCode();
  }, [fetchCode]);

  async function updateCode(newCode: string): Promise<{ error: string | null }> {
    const { error } = await supabase.rpc('update_signup_access_code', { p_new_code: newCode });
    if (error) return { error: error.message };
    await fetchCode();
    return { error: null };
  }

  return { code, loading, error, updateCode, refetch: fetchCode };
}
