import { supabase } from '@/lib/supabase';
import type { Location } from '@/types';

interface LocationFilters {
  isActive?: boolean;
  isMainOffice?: boolean;
  search?: string;
}

export const locationService = {
  // Obtener todas las ubicaciones
  async getLocations(companyId: string, filters: LocationFilters = {}): Promise<Location[]> {
    let query = supabase
      .from('locations')
      .select('*')
      .eq('company_id', companyId);
    
    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }
    
    if (filters.isMainOffice !== undefined) {
      query = query.eq('is_main', filters.isMainOffice);
    }
    
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,city.ilike.%${filters.search}%,address.ilike.%${filters.search}%`);
    }
    
    query = query.order('is_main', { ascending: false }).order('name');
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data as Location[];
  },

  // Obtener ubicación por ID
  async getLocationById(id: string): Promise<Location | null> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Location;
  },

  // Crear ubicación
  async createLocation(location: Partial<Location>): Promise<Location> {
    const { data, error } = await supabase
      .from('locations')
      .insert(location)
      .select()
      .single();
    
    if (error) throw error;
    return data as Location;
  },

  // Actualizar ubicación
  async updateLocation(id: string, updates: Partial<Location>): Promise<Location> {
    const { data, error } = await supabase
      .from('locations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Location;
  },

  // Eliminar ubicación
  async deleteLocation(id: string): Promise<void> {
    // Verificar que no tiene vehículos asignados
    const { count } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('current_location_id', id);
    
    if (count && count > 0) {
      throw new Error('No se puede eliminar una ubicación con vehículos asignados');
    }
    
    // Verificar que no tiene reservas activas
    const { count: bookingsCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .or(`pickup_location_id.eq.${id},return_location_id.eq.${id}`)
      .in('status', ['pending', 'confirmed', 'in_progress']);
    
    if (bookingsCount && bookingsCount > 0) {
      throw new Error('No se puede eliminar una ubicación con reservas activas');
    }
    
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Obtener estadísticas (simplificado - no hay location_type en el esquema)
  async getLocationStats(companyId: string): Promise<{
    total: number;
    offices: number;
    airports: number;
    stations: number;
    deliveryPoints: number;
  }> {
    const { count: total } = await supabase
      .from('locations')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('is_active', true);
    
    // Como no hay location_type, retornamos valores por defecto
    return {
      total: total || 0,
      offices: total || 0,
      airports: 0,
      stations: 0,
      deliveryPoints: 0,
    };
  },

  // Obtener vehículos en una ubicación
  async getVehiclesAtLocation(locationId: string) {
    const { data, error } = await supabase
      .from('vehicles')
      .select('id, brand, model, plate, status')
      .eq('current_location_id', locationId)
      .eq('is_active', true);
    
    if (error) throw error;
    return data;
  },
};
