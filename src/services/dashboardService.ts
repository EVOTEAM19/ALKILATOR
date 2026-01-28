import { supabase } from '@/lib/supabase';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface DashboardStats {
  totalBookings: number;
  bookingsChange: number;
  activeBookings: number;
  activeBookingsChange: number;
  revenue: number;
  revenueChange: number;
  totalCustomers: number;
  customersChange: number;
  fleetSize: number;
  availableVehicles: number;
  occupancyRate: number;
}

export interface BookingsByStatus {
  status: string;
  count: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
  bookings: number;
}

export interface RecentBooking {
  id: string;
  booking_number: string;
  customer_name: string;
  vehicle_group: string;
  pickup_date: string;
  total_price: number;
  status: string;
  created_at: string;
}

export interface UpcomingMaintenance {
  id: string;
  vehicle: string;
  plate: string;
  type: string;
  scheduled_date: string;
  status: string;
}

export const dashboardService = {
  // Obtener estadísticas generales
  async getStats(companyId: string): Promise<DashboardStats> {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));
    
    // Reservas este mes
    const { count: thisMonthBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .gte('created_at', thisMonthStart.toISOString())
      .lte('created_at', thisMonthEnd.toISOString());
    
    // Reservas mes pasado
    const { count: lastMonthBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .gte('created_at', lastMonthStart.toISOString())
      .lte('created_at', lastMonthEnd.toISOString());
    
    // Reservas activas (en progreso o confirmadas)
    const { count: activeBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .in('status', ['confirmed', 'in_progress']);
    
    // Ingresos este mes
    const { data: revenueData } = await supabase
      .from('bookings')
      .select('total_price')
      .eq('company_id', companyId)
      .eq('is_paid', true)
      .gte('created_at', thisMonthStart.toISOString())
      .lte('created_at', thisMonthEnd.toISOString());
    
    const thisMonthRevenue = revenueData?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;
    
    // Ingresos mes pasado
    const { data: lastRevenueData } = await supabase
      .from('bookings')
      .select('total_price')
      .eq('company_id', companyId)
      .eq('is_paid', true)
      .gte('created_at', lastMonthStart.toISOString())
      .lte('created_at', lastMonthEnd.toISOString());
    
    const lastMonthRevenue = lastRevenueData?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;
    
    // Total clientes
    const { count: totalCustomers } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId);
    
    // Clientes nuevos este mes
    const { count: newCustomers } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .gte('created_at', thisMonthStart.toISOString());
    
    // Flota
    const { count: fleetSize } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('is_active', true);
    
    const { count: availableVehicles } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('is_active', true)
      .eq('status', 'available');
    
    // Calcular cambios porcentuales
    const calcChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };
    
    return {
      totalBookings: thisMonthBookings || 0,
      bookingsChange: calcChange(thisMonthBookings || 0, lastMonthBookings || 0),
      activeBookings: activeBookings || 0,
      activeBookingsChange: 0, // No hay comparación directa
      revenue: thisMonthRevenue,
      revenueChange: calcChange(thisMonthRevenue, lastMonthRevenue),
      totalCustomers: totalCustomers || 0,
      customersChange: newCustomers || 0,
      fleetSize: fleetSize || 0,
      availableVehicles: availableVehicles || 0,
      occupancyRate: fleetSize ? Math.round(((fleetSize - (availableVehicles || 0)) / fleetSize) * 100) : 0,
    };
  },
  
  // Obtener reservas por estado
  async getBookingsByStatus(companyId: string): Promise<BookingsByStatus[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('status')
      .eq('company_id', companyId);
    
    if (error) throw error;
    
    // Agrupar por estado
    const grouped = data.reduce((acc: Record<string, number>, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(grouped).map(([status, count]) => ({
      status,
      count,
    }));
  },
  
  // Obtener ingresos por mes (últimos 6 meses)
  async getRevenueByMonth(companyId: string): Promise<RevenueByMonth[]> {
    const months: RevenueByMonth[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const { data } = await supabase
        .from('bookings')
        .select('total_price')
        .eq('company_id', companyId)
        .eq('is_paid', true)
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString());
      
      const { count } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString());
      
      months.push({
        month: format(date, 'MMM', { locale: es }),
        revenue: data?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0,
        bookings: count || 0,
      });
    }
    
    return months;
  },
  
  // Obtener reservas recientes
  async getRecentBookings(companyId: string, limit = 5): Promise<RecentBooking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_number,
        pickup_date,
        total_price,
        status,
        created_at,
        customer:customers(first_name, last_name),
        vehicle_group:vehicle_groups(name)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data.map((b: any) => ({
      id: b.id,
      booking_number: b.booking_number,
      customer_name: `${b.customer?.first_name || ''} ${b.customer?.last_name || ''}`.trim() || 'Sin cliente',
      vehicle_group: b.vehicle_group?.name || 'Sin grupo',
      pickup_date: b.pickup_date,
      total_price: b.total_price,
      status: b.status,
      created_at: b.created_at,
    }));
  },
  
  // Obtener mantenimientos próximos
  async getUpcomingMaintenance(companyId: string, limit = 5): Promise<UpcomingMaintenance[]> {
    const { data, error } = await supabase
      .from('vehicle_maintenance')
      .select(`
        id,
        maintenance_type,
        scheduled_date,
        status,
        vehicle:vehicles(brand, model, plate)
      `)
      .eq('company_id', companyId)
      .in('status', ['scheduled', 'pending'])
      .gte('scheduled_date', new Date().toISOString())
      .order('scheduled_date', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    
    return data.map((m: any) => ({
      id: m.id,
      vehicle: `${m.vehicle?.brand || ''} ${m.vehicle?.model || ''}`.trim(),
      plate: m.vehicle?.plate || '',
      type: m.maintenance_type,
      scheduled_date: m.scheduled_date,
      status: m.status,
    }));
  },
};
