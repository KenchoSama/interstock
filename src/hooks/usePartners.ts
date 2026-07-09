import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Partner {
  id: string;
  name: string;
  type: string;
  contact: string | null;
  status: string;
}

export function usePartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('partners')
        .select('id, name, type, contact, status')
        .order('name', { ascending: true });

      setPartners(data ?? []);
      setLoading(false);
    }
    fetch();
  }, []);

  return { partners, loading };
}
