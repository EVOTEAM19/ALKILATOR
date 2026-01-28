import { supabase } from '@/lib/supabase';
import type { DiscountCode } from '@/types';

interface DiscountFilters {
  isActive?: boolean;
  discountType?: string;
  search?: string;
}

export const discountService = {
  // Obtener todos los códigos de descuento
  async getDiscounts(companyId: string, filters: DiscountFilters = {}): Promise<DiscountCode[]> {
    let query = supabase
      .from('discount_codes')
      .select('*')
      .eq('company_id', companyId);
    
    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }
    
    if (filters.discountType) {
      query = query.eq('discount_type', filters.discountType);
    }
    
    if (filters.search) {
      query = query.ilike('code', `%${filters.search}%`);
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data as DiscountCode[];
  },

  // Obtener descuento por ID
  async getDiscountById(id: string): Promise<DiscountCode | null> {
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as DiscountCode;
  },

  // Crear descuento
  async createDiscount(discount: Partial<DiscountCode>): Promise<DiscountCode> {
    // Verificar que el código no existe
    const { data: existing } = await supabase
      .from('discount_codes')
      .select('id')
      .eq('company_id', discount.company_id)
      .eq('code', discount.code?.toUpperCase())
      .single();
    
    if (existing) {
      throw new Error('Ya existe un código con este nombre');
    }
    
    const { data, error } = await supabase
      .from('discount_codes')
      .insert({
        ...discount,
        code: discount.code?.toUpperCase(),
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as DiscountCode;
  },

  // Actualizar descuento
  async updateDiscount(id: string, updates: Partial<DiscountCode>): Promise<DiscountCode> {
    const { data, error } = await supabase
      .from('discount_codes')
      .update({
        ...updates,
        code: updates.code?.toUpperCase(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as DiscountCode;
  },

  // Eliminar descuento
  async deleteDiscount(id: string): Promise<void> {
    const { error } = await supabase
      .from('discount_codes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Obtener estadísticas de uso
  async getDiscountStats(companyId: string): Promise<{
    totalActive: number;
    totalUsedThisMonth: number;
    totalSavings: number;
    mostUsed: { code: string; uses: number }[];
  }> {
    const { count: totalActive } = await supabase
      .from('discount_codes')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('is_active', true);
    
    // Obtener descuentos con usos
    const { data: discounts } = await supabase
      .from('discount_codes')
      .select('code, current_uses')
      .eq('company_id', companyId)
      .gt('current_uses', 0)
      .order('current_uses', { ascending: false })
      .limit(5);
    
    // Calcular ahorros totales (aproximado basado en reservas con descuento)
    const { data: bookingsWithDiscount } = await supabase
      .from('bookings')
      .select('discount_amount')
      .eq('company_id', companyId)
      .gt('discount_amount', 0);
    
    const totalSavings = bookingsWithDiscount?.reduce((sum, b) => sum + (b.discount_amount || 0), 0) || 0;
    
    return {
      totalActive: totalActive || 0,
      totalUsedThisMonth: discounts?.reduce((sum, d) => sum + d.current_uses, 0) || 0,
      totalSavings,
      mostUsed: discounts?.map(d => ({ code: d.code, uses: d.current_uses })) || [],
    };
  },

  // Generar código aleatorio
  generateCode(length = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  },
};
