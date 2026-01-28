import { supabase } from '@/lib/supabase';
import type { Vehicle, VehicleGroup, AvailableVehicle, VehicleFilters, PaginatedResponse } from '@/types';

interface GetAvailableVehiclesParams {
  companyId?: string;
  pickupDate: string;
  returnDate: string;
  pickupLocationId?: string;
  vehicleType?: 'car' | 'van';
}

interface VehicleWithGroup extends Vehicle {
  vehicle_group: VehicleGroup;
}

export const vehicleService = {
  // Obtener vehículos disponibles para un rango de fechas
  async getAvailableVehicles(params: GetAvailableVehiclesParams): Promise<AvailableVehicle[]> {
    const { pickupDate, returnDate, pickupLocationId, vehicleType } = params;
    
    // 1. Obtener todos los vehículos activos con su grupo
    let query = supabase
      .from('vehicles')
      .select(`
        *,
        vehicle_group:vehicle_groups(*)
      `)
      .eq('is_active', true)
      .eq('status', 'available');
    
    // Filtrar por tipo de vehículo
    if (vehicleType) {
      query = query.eq('vehicle_group.vehicle_type', vehicleType);
    }
    
    // Filtrar por ubicación
    if (pickupLocationId) {
      query = query.eq('current_location_id', pickupLocationId);
    }
    
    const { data: vehicles, error: vehiclesError } = await query;
    
    if (vehiclesError) throw vehiclesError;
    
    // 2. Obtener reservas que se solapan con las fechas
    // Un vehículo está ocupado si: pickup_date <= returnDate AND return_date >= pickupDate
    const { data: allBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('vehicle_id, pickup_date, return_date')
      .not('status', 'in', '(cancelled,completed)')
      .not('vehicle_id', 'is', null);
    
    if (bookingsError) throw bookingsError;
    
    // Filtrar reservas solapadas en JavaScript
    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);
    const bookedVehicleIds = new Set(
      allBookings
        ?.filter((b) => {
          if (!b.vehicle_id || !b.pickup_date || !b.return_date) return false;
          const bookingPickup = new Date(b.pickup_date);
          const bookingReturn = new Date(b.return_date);
          return bookingPickup <= returnD && bookingReturn >= pickup;
        })
        .map((b) => b.vehicle_id) || []
    );
    
    // 3. Filtrar vehículos disponibles
    const availableVehicles = (vehicles as VehicleWithGroup[])?.filter(
      v => !bookedVehicleIds.has(v.id) && v.vehicle_group
    ) || [];
    
    // 4. Obtener precios de la tarifa general
    const { data: rates, error: ratesError } = await supabase
      .from('rates')
      .select(`
        id,
        name,
        rate_group_prices(*)
      `)
      .eq('is_active', true)
      .eq('show_on_web', true)
      .is('valid_from', null) // Tarifa general
      .single();
    
    if (ratesError && ratesError.code !== 'PGRST116') {
      console.error('Error fetching rates:', ratesError);
    }
    
    // Calcular días (pickup y returnD ya declarados arriba)
    const totalDays = Math.max(1, Math.ceil((returnD.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24)));
    
    // 5. Mapear a AvailableVehicle con precios
    const result: AvailableVehicle[] = availableVehicles.map(v => {
      // Buscar precio para este grupo y días
      const groupPrices = rates?.rate_group_prices?.filter(
        (p: any) => p.vehicle_group_id === v.vehicle_group_id
      ) || [];
      
      const priceTier = groupPrices.find(
        (p: any) => p.min_days <= totalDays && (!p.max_days || p.max_days >= totalDays)
      );
      
      const dailyPrice = priceTier?.daily_price || 0;
      const kmPerDay = priceTier?.km_per_day || 150;
      
      return {
        id: v.id,
        vehicle_group_id: v.vehicle_group_id!,
        brand: v.brand,
        model: v.model,
        year: v.year,
        plate: v.plate,
        fuel_type: v.fuel_type,
        transmission: v.transmission,
        seats: v.seats,
        image_url: v.image_url || undefined,
        features: v.features as string[],
        group_name: v.vehicle_group.name,
        group_code: v.vehicle_group.code,
        deposit_amount: v.vehicle_group.deposit_amount,
        daily_price: dailyPrice,
        total_price: dailyPrice * totalDays,
        km_per_day: kmPerDay,
      };
    });
    
    // 6. Agrupar por grupo de vehículo (mostrar el más barato de cada grupo)
    const groupedMap = new Map<string, AvailableVehicle>();
    
    result.forEach(vehicle => {
      const existing = groupedMap.get(vehicle.vehicle_group_id);
      if (!existing || vehicle.daily_price < existing.daily_price) {
        groupedMap.set(vehicle.vehicle_group_id, vehicle);
      }
    });
    
    return Array.from(groupedMap.values()).sort((a, b) => a.daily_price - b.daily_price);
  },
  
  // Obtener un vehículo por ID
  async getVehicleById(id: string): Promise<Vehicle | null> {
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        vehicle_group:vehicle_groups(*),
        current_location:locations(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // Obtener todos los vehículos (para admin)
  async getAllVehicles(filters?: {
    status?: string;
    vehicleGroupId?: string;
    locationId?: string;
    search?: string;
  }) {
    let query = supabase
      .from('vehicles')
      .select(`
        *,
        vehicle_group:vehicle_groups(id, name, code),
        current_location:locations(id, name)
      `)
      .order('brand')
      .order('model');
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.vehicleGroupId) {
      query = query.eq('vehicle_group_id', filters.vehicleGroupId);
    }
    
    if (filters?.locationId) {
      query = query.eq('current_location_id', filters.locationId);
    }
    
    if (filters?.search) {
      query = query.or(`plate.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,model.ilike.%${filters.search}%`);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data as Vehicle[];
  },
  
  // Obtener vehículos con paginación y filtros
  async getVehiclesPaginated(
    companyId: string,
    filters: VehicleFilters = {},
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<Vehicle>> {
    let query = supabase
      .from('vehicles')
      .select(`
        *,
        vehicle_group:vehicle_groups(id, name, code, vehicle_type),
        current_location:locations(id, name)
      `, { count: 'exact' })
      .eq('company_id', companyId);
    
    // Aplicar filtros
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.vehicle_group_id) {
      query = query.eq('vehicle_group_id', filters.vehicle_group_id);
    }
    
    if (filters.location_id) {
      query = query.eq('current_location_id', filters.location_id);
    }
    
    if (filters.fuel_type) {
      query = query.eq('fuel_type', filters.fuel_type);
    }
    
    if (filters.transmission) {
      query = query.eq('transmission', filters.transmission);
    }
    
    // Solo mostrar activos por defecto
    query = query.eq('is_active', true);
    
    if (filters.search) {
      query = query.ilike('plate', `%${filters.search}%`);
    }
    
    // Ordenación
    query = query.order('brand', { ascending: true });
    
    // Paginación
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      data: data as Vehicle[],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  },
  
  // Crear vehículo
  async createVehicle(vehicle: Partial<Vehicle>): Promise<Vehicle> {
    const { data, error } = await supabase
      .from('vehicles')
      .insert(vehicle)
      .select(`
        *,
        vehicle_group:vehicle_groups(id, name, code),
        current_location:locations(id, name)
      `)
      .single();
    
    if (error) throw error;
    return data as Vehicle;
  },
  
  // Actualizar vehículo
  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle> {
    const { data, error } = await supabase
      .from('vehicles')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        vehicle_group:vehicle_groups(id, name, code),
        current_location:locations(id, name)
      `)
      .single();
    
    if (error) throw error;
    return data as Vehicle;
  },
  
  // Eliminar vehículo (soft delete)
  async deleteVehicle(id: string): Promise<void> {
    const { error } = await supabase
      .from('vehicles')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) throw error;
  },
  
  // Obtener estadísticas de flota
  async getFleetStats(companyId: string): Promise<{
    total: number;
    available: number;
    rented: number;
    maintenance: number;
    reserved: number;
    inactive: number;
    byGroup: { group: string; count: number }[];
    byFuelType: { fuel: string; count: number }[];
  }> {
    // Total activos
    const { count: total } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('is_active', true);
    
    // Por estado
    const { data: statusData } = await supabase
      .from('vehicles')
      .select('status')
      .eq('company_id', companyId)
      .eq('is_active', true);
    
    const statusCounts = statusData?.reduce((acc: Record<string, number>, v) => {
      acc[v.status] = (acc[v.status] || 0) + 1;
      return acc;
    }, {}) || {};
    
    // Por grupo
    const { data: groupData } = await supabase
      .from('vehicles')
      .select('vehicle_group:vehicle_groups(name)')
      .eq('company_id', companyId)
      .eq('is_active', true);
    
    const groupCounts = groupData?.reduce((acc: Record<string, number>, v: any) => {
      const name = v.vehicle_group?.name || 'Sin grupo';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {}) || {};
    
    // Por combustible
    const { data: fuelData } = await supabase
      .from('vehicles')
      .select('fuel_type')
      .eq('company_id', companyId)
      .eq('is_active', true);
    
    const fuelCounts = fuelData?.reduce((acc: Record<string, number>, v) => {
      acc[v.fuel_type] = (acc[v.fuel_type] || 0) + 1;
      return acc;
    }, {}) || {};
    
    // Inactivos
    const { count: inactive } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('is_active', false);
    
    return {
      total: total || 0,
      available: statusCounts['available'] || 0,
      rented: statusCounts['rented'] || 0,
      maintenance: statusCounts['maintenance'] || 0,
      reserved: statusCounts['reserved'] || 0,
      inactive: inactive || 0,
      byGroup: Object.entries(groupCounts).map(([group, count]) => ({ group, count: count as number })),
      byFuelType: Object.entries(fuelCounts).map(([fuel, count]) => ({ fuel, count: count as number })),
    };
  },
  
  // Obtener historial de reservas de un vehículo
  async getVehicleBookingHistory(vehicleId: string, limit = 10) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_number,
        pickup_date,
        return_date,
        total_price,
        status,
        customer:customers(first_name, last_name)
      `)
      .eq('vehicle_id', vehicleId)
      .order('pickup_date', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },
  
  // Obtener mantenimientos de un vehículo
  async getVehicleMaintenances(vehicleId: string, limit = 10) {
    const { data, error } = await supabase
      .from('vehicle_maintenance')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('scheduled_date', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },
};
