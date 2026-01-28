import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Location } from '@/types';

export function useLocations(companyId?: string) {
  return useQuery({
    queryKey: ['locations', companyId],
    queryFn: async () => {
      let query = supabase
        .from('locations')
        .select('*')
        .eq('is_active', true)
        .order('is_main', { ascending: false })
        .order('name');
      
      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Location[];
    },
  });
}

export function useLocation(id: string) {
  return useQuery({
    queryKey: ['location', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Location;
    },
    enabled: !!id,
  });
}
