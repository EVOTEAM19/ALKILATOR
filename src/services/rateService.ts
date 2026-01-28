import { supabase } from '@/lib/supabase';
import type { Rate } from '@/types';

// Tipo simplificado para filtros (ajustado al esquema real)
interface RateFilters {
  vehicleGroupId?: string;
  isActive?: boolean;
}

export const rateService = {
  // Obtener todas las tarifas de una empresa
  async getRates(companyId: string, filters: RateFilters = {}): Promise<Rate[]> {
    let query = supabase
      .from('rates')
      .select(`
        *,
        prices:rate_group_prices(
          *,
          vehicle_group:vehicle_groups(id, name, code)
        )
      `)
      .eq('company_id', companyId);
    
    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Filtrar por grupo si se especifica
    if (filters.vehicleGroupId && data) {
      return data.filter((rate: any) => 
        rate.prices?.some((p: any) => p.vehicle_group_id === filters.vehicleGroupId)
      ) as Rate[];
    }
    
    return data as Rate[];
  },

  // Obtener tarifa por ID
  async getRateById(id: string): Promise<Rate | null> {
    const { data, error } = await supabase
      .from('rates')
      .select(`
        *,
        prices:rate_group_prices(
          *,
          vehicle_group:vehicle_groups(id, name, code)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Rate;
  },

  // Crear tarifa
  async createRate(rate: Partial<Rate>): Promise<Rate> {
    const { data, error } = await supabase
      .from('rates')
      .insert(rate)
      .select(`
        *,
        prices:rate_group_prices(
          *,
          vehicle_group:vehicle_groups(id, name, code)
        )
      `)
      .single();
    
    if (error) throw error;
    return data as Rate;
  },

  // Actualizar tarifa
  async updateRate(id: string, updates: Partial<Rate>): Promise<Rate> {
    const { data, error } = await supabase
      .from('rates')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        prices:rate_group_prices(
          *,
          vehicle_group:vehicle_groups(id, name, code)
        )
      `)
      .single();
    
    if (error) throw error;
    return data as Rate;
  },

  // Eliminar tarifa
  async deleteRate(id: string): Promise<void> {
    const { error } = await supabase
      .from('rates')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Duplicar tarifa
  async duplicateRate(id: string): Promise<Rate> {
    const original = await this.getRateById(id);
    if (!original) throw new Error('Tarifa no encontrada');
    
    const { id: _, created_at, updated_at, prices, ...rateData } = original as any;
    
    const duplicated = await this.createRate({
      ...rateData,
      name: `${original.name} (copia)`,
    });
    
    // Duplicar los precios de grupo si existen
    if (prices && prices.length > 0) {
      const priceInserts = prices.map((p: any) => ({
        rate_id: duplicated.id,
        vehicle_group_id: p.vehicle_group_id,
        min_days: p.min_days,
        max_days: p.max_days,
        daily_price: p.daily_price,
        km_per_day: p.km_per_day,
        unlimited_km: p.unlimited_km,
      }));
      
      await supabase.from('rate_group_prices').insert(priceInserts);
    }
    
    return this.getRateById(duplicated.id) as Promise<Rate>;
  },

  // Obtener precio para un rango de fechas (simplificado)
  async getPriceForDateRange(
    companyId: string,
    vehicleGroupId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    dailyPrice: number;
    totalPrice: number;
    days: number;
    kmPerDay: number;
    rateName: string;
  } | null> {
    // Buscar tarifa aplicable
    const { data: rates, error } = await supabase
      .from('rates')
      .select(`
        *,
        prices:rate_group_prices(*)
      `)
      .eq('company_id', companyId)
      .eq('is_active', true)
      .lte('valid_from', startDate)
      .gte('valid_until', endDate)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    
    let rate: any = null;
    
    if (!rates || rates.length === 0) {
      // Buscar tarifa por defecto (sin fechas)
      const { data: defaultRates } = await supabase
        .from('rates')
        .select(`
          *,
          prices:rate_group_prices(*)
        `)
        .eq('company_id', companyId)
        .eq('is_active', true)
        .is('valid_from', null)
        .limit(1);
      
      if (!defaultRates || defaultRates.length === 0) return null;
      rate = defaultRates[0];
    } else {
      rate = rates[0];
    }
    
    // Buscar precio para el grupo de vehículo
    const groupPrice = rate.prices?.find((p: any) => p.vehicle_group_id === vehicleGroupId);
    if (!groupPrice) return null;
    
    const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) || 1;
    
    // Buscar precio según rango de días
    const priceTier = rate.prices?.find((p: any) => 
      p.vehicle_group_id === vehicleGroupId &&
      p.min_days <= days &&
      (!p.max_days || p.max_days >= days)
    );
    
    if (!priceTier) return null;
    
    return {
      dailyPrice: priceTier.daily_price,
      totalPrice: priceTier.daily_price * days,
      days,
      kmPerDay: priceTier.km_per_day || 150,
      rateName: rate.name,
    };
  },
};
