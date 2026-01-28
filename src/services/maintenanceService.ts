import { supabase } from '@/lib/supabase';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import type { VehicleMaintenance, MaintenanceFilters, PaginatedResponse } from '@/types';

export const maintenanceService = {
  // Obtener mantenimientos con paginación y filtros
  async getMaintenances(
    companyId: string,
    filters: MaintenanceFilters = {},
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<VehicleMaintenance>> {
    let query = supabase
      .from('vehicle_maintenance')
      .select(`
        *,
        vehicle:vehicles(id, brand, model, plate, current_mileage)
      `, { count: 'exact' })
      .eq('company_id', companyId);
    
    // Aplicar filtros
    const vehicleId = filters.vehicleId || filters.vehicle_id;
    if (vehicleId) {
      query = query.eq('vehicle_id', vehicleId);
    }
    
    const maintenanceType = filters.maintenanceType || filters.maintenance_type;
    if (maintenanceType) {
      query = query.eq('maintenance_type', maintenanceType);
    }
    
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }
    
    const dateFrom = filters.dateFrom || filters.date_from;
    if (dateFrom) {
      query = query.gte('scheduled_date', dateFrom);
    }
    
    const dateTo = filters.dateTo || filters.date_to;
    if (dateTo) {
      query = query.lte('scheduled_date', dateTo);
    }
    
    if (filters.search) {
      // Búsqueda simplificada por matrícula
      query = query.ilike('vehicle.plate', `%${filters.search}%`);
    }
    
    // Ordenación
    const orderBy = filters.orderBy || 'scheduled_date';
    const orderDir = filters.orderDir || 'desc';
    query = query.order(orderBy, { ascending: orderDir === 'asc' });
    
    // Paginación
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      data: data as VehicleMaintenance[],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  },

  // Obtener mantenimiento por ID
  async getMaintenanceById(id: string): Promise<VehicleMaintenance | null> {
    const { data, error } = await supabase
      .from('vehicle_maintenance')
      .select(`
        *,
        vehicle:vehicles(id, brand, model, plate, current_mileage, vehicle_group:vehicle_groups(name))
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as VehicleMaintenance;
  },

  // Crear mantenimiento
  async createMaintenance(maintenance: Partial<VehicleMaintenance>): Promise<VehicleMaintenance> {
    const { data, error } = await supabase
      .from('vehicle_maintenance')
      .insert(maintenance)
      .select(`
        *,
        vehicle:vehicles(id, brand, model, plate)
      `)
      .single();
    
    if (error) throw error;
    
    // Si el mantenimiento está en progreso, actualizar estado del vehículo
    if (maintenance.status === 'in_progress') {
      await supabase
        .from('vehicles')
        .update({ status: 'maintenance' })
        .eq('id', maintenance.vehicle_id);
    }
    
    return data as VehicleMaintenance;
  },

  // Actualizar mantenimiento
  async updateMaintenance(id: string, updates: Partial<VehicleMaintenance>): Promise<VehicleMaintenance> {
    const { data, error } = await supabase
      .from('vehicle_maintenance')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        vehicle:vehicles(id, brand, model, plate)
      `)
      .single();
    
    if (error) throw error;
    return data as VehicleMaintenance;
  },

  // Completar mantenimiento
  async completeMaintenance(
    id: string, 
    data: {
      completedDate: string;
      cost: number;
      mileageAtService?: number;
      notes?: string;
      invoiceNumber?: string;
    }
  ): Promise<VehicleMaintenance> {
    const maintenance = await this.getMaintenanceById(id);
    if (!maintenance) throw new Error('Mantenimiento no encontrado');
    
    const { data: updated, error } = await supabase
      .from('vehicle_maintenance')
      .update({
        status: 'completed',
        completed_date: data.completedDate,
        actual_cost: data.cost,
        completed_mileage: data.mileageAtService,
        notes: data.notes,
      })
      .eq('id', id)
      .select(`
        *,
        vehicle:vehicles(id, brand, model, plate)
      `)
      .single();
    
    if (error) throw error;
    
    // Actualizar kilometraje del vehículo si se proporciona
    if (data.mileageAtService) {
      await supabase
        .from('vehicles')
        .update({ 
          current_mileage: data.mileageAtService,
          status: 'available' // Devolver a disponible
        })
        .eq('id', maintenance.vehicle_id);
    } else {
      // Solo cambiar estado a disponible
      await supabase
        .from('vehicles')
        .update({ status: 'available' })
        .eq('id', maintenance.vehicle_id);
    }
    
    return updated as VehicleMaintenance;
  },

  // Cancelar mantenimiento
  async cancelMaintenance(id: string, reason?: string): Promise<VehicleMaintenance> {
    const maintenance = await this.getMaintenanceById(id);
    if (!maintenance) throw new Error('Mantenimiento no encontrado');
    
    const { data, error } = await supabase
      .from('vehicle_maintenance')
      .update({
        status: 'cancelled',
        notes: reason ? `${maintenance.notes || ''}\n[CANCELADO] ${reason}`.trim() : maintenance.notes,
      })
      .eq('id', id)
      .select(`
        *,
        vehicle:vehicles(id, brand, model, plate)
      `)
      .single();
    
    if (error) throw error;
    
    // Si el vehículo estaba en mantenimiento, devolverlo a disponible
    if (maintenance.status === 'in_progress') {
      await supabase
        .from('vehicles')
        .update({ status: 'available' })
        .eq('id', maintenance.vehicle_id);
    }
    
    return data as VehicleMaintenance;
  },

  // Eliminar mantenimiento
  async deleteMaintenance(id: string): Promise<void> {
    const { error } = await supabase
      .from('vehicle_maintenance')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Obtener estadísticas de mantenimientos
  async getMaintenanceStats(companyId: string): Promise<{
    pending: number;
    scheduled: number;
    inProgress: number;
    completedThisMonth: number;
    totalCostThisMonth: number;
    upcomingCount: number;
    overdueCount: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const monthStart = startOfMonth(new Date()).toISOString();
    const monthEnd = endOfMonth(new Date()).toISOString();
    
    // Pendientes
    const { count: pending } = await supabase
      .from('vehicle_maintenance')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'pending');
    
    // Programados
    const { count: scheduled } = await supabase
      .from('vehicle_maintenance')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'scheduled');
    
    // En progreso
    const { count: inProgress } = await supabase
      .from('vehicle_maintenance')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'in_progress');
    
    // Completados este mes
    const { data: completedData } = await supabase
      .from('vehicle_maintenance')
      .select('actual_cost')
      .eq('company_id', companyId)
      .eq('status', 'completed')
      .gte('completed_date', monthStart.split('T')[0])
      .lte('completed_date', monthEnd.split('T')[0]);
    
    // Próximos (en los próximos 7 días)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const { count: upcomingCount } = await supabase
      .from('vehicle_maintenance')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .in('status', ['pending', 'scheduled'])
      .lte('scheduled_date', nextWeek.toISOString().split('T')[0])
      .gte('scheduled_date', today);
    
    // Atrasados
    const { count: overdueCount } = await supabase
      .from('vehicle_maintenance')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .in('status', ['pending', 'scheduled'])
      .lt('scheduled_date', today);
    
    return {
      pending: pending || 0,
      scheduled: scheduled || 0,
      inProgress: inProgress || 0,
      completedThisMonth: completedData?.length || 0,
      totalCostThisMonth: completedData?.reduce((sum, m) => sum + (m.actual_cost || 0), 0) || 0,
      upcomingCount: upcomingCount || 0,
      overdueCount: overdueCount || 0,
    };
  },

  // Obtener próximos mantenimientos
  async getUpcomingMaintenances(companyId: string, limit = 10) {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('vehicle_maintenance')
      .select(`
        *,
        vehicle:vehicles(id, brand, model, plate)
      `)
      .eq('company_id', companyId)
      .in('status', ['pending', 'scheduled'])
      .gte('scheduled_date', today)
      .order('scheduled_date', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Obtener mantenimientos atrasados
  async getOverdueMaintenances(companyId: string) {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('vehicle_maintenance')
      .select(`
        *,
        vehicle:vehicles(id, brand, model, plate)
      `)
      .eq('company_id', companyId)
      .in('status', ['pending', 'scheduled'])
      .lt('scheduled_date', today)
      .order('scheduled_date', { ascending: true });
    
    if (error) throw error;
    return data;
  },
};
