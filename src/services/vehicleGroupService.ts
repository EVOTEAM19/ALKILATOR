import { supabase } from '@/lib/supabase';
import type { VehicleGroup } from '@/types';

export const vehicleGroupService = {
  // Obtener todos los grupos de una empresa
  async getGroups(companyId: string): Promise<VehicleGroup[]> {
    const { data, error } = await supabase
      .from('vehicle_groups')
      .select('*')
      .eq('company_id', companyId)
      .order('display_order')
      .order('name');
    
    if (error) throw error;
    return data as VehicleGroup[];
  },

  // Obtener grupo por ID
  async getGroupById(id: string): Promise<VehicleGroup | null> {
    const { data, error } = await supabase
      .from('vehicle_groups')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as VehicleGroup;
  },

  // Crear grupo
  async createGroup(group: Partial<VehicleGroup>): Promise<VehicleGroup> {
    const { data, error } = await supabase
      .from('vehicle_groups')
      .insert(group)
      .select()
      .single();
    
    if (error) throw error;
    return data as VehicleGroup;
  },

  // Actualizar grupo
  async updateGroup(id: string, updates: Partial<VehicleGroup>): Promise<VehicleGroup> {
    const { data, error } = await supabase
      .from('vehicle_groups')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as VehicleGroup;
  },

  // Eliminar grupo
  async deleteGroup(id: string): Promise<void> {
    // Verificar que no tiene vehículos
    const { count } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('vehicle_group_id', id);
    
    if (count && count > 0) {
      throw new Error('No se puede eliminar un grupo que tiene vehículos asignados');
    }
    
    const { error } = await supabase
      .from('vehicle_groups')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Obtener estadísticas del grupo
  async getGroupStats(groupId: string): Promise<{
    totalVehicles: number;
    available: number;
    rented: number;
    maintenance: number;
  }> {
    const { data } = await supabase
      .from('vehicles')
      .select('status')
      .eq('vehicle_group_id', groupId)
      .eq('is_active', true);
    
    const statusCounts = data?.reduce((acc: Record<string, number>, v) => {
      acc[v.status] = (acc[v.status] || 0) + 1;
      return acc;
    }, {}) || {};
    
    return {
      totalVehicles: data?.length || 0,
      available: statusCounts['available'] || 0,
      rented: statusCounts['rented'] || 0,
      maintenance: statusCounts['maintenance'] || 0,
    };
  },

  // Reordenar grupos
  async reorderGroups(companyId: string, orderedIds: string[]): Promise<void> {
    const updates = orderedIds.map((id, index) => ({
      id,
      display_order: index + 1,
    }));
    
    for (const update of updates) {
      await supabase
        .from('vehicle_groups')
        .update({ display_order: update.display_order })
        .eq('id', update.id);
    }
  },
};
