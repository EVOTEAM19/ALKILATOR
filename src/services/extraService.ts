import { supabase } from '@/lib/supabase';
import type { Extra } from '@/types';

export const extraService = {
  // Obtener todos los extras activos para la web
  async getExtrasForWeb(companyId?: string): Promise<Extra[]> {
    let query = supabase
      .from('extras')
      .select('*')
      .eq('is_active', true)
      .eq('show_on_web', true)
      .order('display_order')
      .order('name');
    
    if (companyId) {
      query = query.eq('company_id', companyId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data as Extra[];
  },
  
  // Obtener todos los extras (para admin)
  async getAllExtras(companyId: string): Promise<Extra[]> {
    const { data, error } = await supabase
      .from('extras')
      .select('*')
      .eq('company_id', companyId)
      .order('display_order')
      .order('name');
    
    if (error) throw error;
    return data as Extra[];
  },
  
  // Obtener extra por ID
  async getExtraById(id: string): Promise<Extra | null> {
    const { data, error } = await supabase
      .from('extras')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Extra;
  },
  
  // Crear extra
  async createExtra(extra: Partial<Extra>): Promise<Extra> {
    const { data, error } = await supabase
      .from('extras')
      .insert(extra)
      .select()
      .single();
    
    if (error) throw error;
    return data as Extra;
  },
  
  // Actualizar extra
  async updateExtra(id: string, updates: Partial<Extra>): Promise<Extra> {
    const { data, error } = await supabase
      .from('extras')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Extra;
  },
  
  // Eliminar extra
  async deleteExtra(id: string): Promise<void> {
    const { error } = await supabase
      .from('extras')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};
