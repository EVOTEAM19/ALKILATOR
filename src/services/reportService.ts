import { supabase } from '@/lib/supabase';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear, 
  subMonths, 
  subYears,
  eachMonthOfInterval,
  eachDayOfInterval,
  format,
  parseISO,
  differenceInDays
} from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
// @ts-ignore - jspdf-autotable no tiene tipos oficiales
import autoTable from 'jspdf-autotable';

export interface ReportFilters {
  startDate: string;
  endDate: string;
  vehicleGroupId?: string;
  locationId?: string;
  status?: string;
}

export interface BookingReport {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  averageDuration: number;
  occupancyRate: number;
  bookingsByStatus: { status: string; count: number }[];
  bookingsByGroup: { group: string; count: number; revenue: number }[];
  bookingsByLocation: { location: string; count: number }[];
  bookingsByMonth: { month: string; count: number; revenue: number }[];
  topCustomers: { name: string; bookings: number; revenue: number }[];
}

export interface FleetReport {
  totalVehicles: number;
  activeVehicles: number;
  vehiclesByStatus: { status: string; count: number }[];
  vehiclesByGroup: { group: string; count: number }[];
  maintenanceCosts: number;
  averageMileage: number;
  utilizationRate: number;
  vehiclesNeedingMaintenance: number;
}

export interface FinancialReport {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  revenueByMonth: { month: string; revenue: number; expenses: number; profit: number }[];
  revenueByCategory: { category: string; amount: number; percentage: number }[];
  topExpenseCategories: { category: string; amount: number }[];
  pendingPayments: number;
  averagePaymentTime: number;
}

export const reportService = {
  // ==================== REPORTE DE RESERVAS ====================
  async getBookingsReport(companyId: string, filters: ReportFilters): Promise<BookingReport> {
    const { startDate, endDate, vehicleGroupId, locationId, status } = filters;

    // Query base de reservas
    let query = supabase
      .from('bookings')
      .select(`
        id,
        booking_number,
        status,
        total_price,
        pickup_date,
        return_date,
        customer:customers(first_name, last_name),
        vehicle_group:vehicle_groups(name),
        pickup_location:locations!bookings_pickup_location_id_fkey(name)
      `)
      .eq('company_id', companyId)
      .gte('pickup_date', startDate)
      .lte('pickup_date', endDate);

    if (vehicleGroupId) query = query.eq('vehicle_group_id', vehicleGroupId);
    if (locationId) query = query.eq('pickup_location_id', locationId);
    if (status) query = query.eq('status', status);

    const { data: bookings, error } = await query;
    if (error) throw error;

    // Calcular métricas
    const totalBookings = bookings?.length || 0;
    const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;
    const cancelledBookings = bookings?.filter(b => b.status === 'cancelled').length || 0;
    const totalRevenue = bookings?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Duración promedio
    const durations = bookings?.map(b => {
      const days = differenceInDays(parseISO(b.return_date), parseISO(b.pickup_date));
      return days || 1;
    }) || [];
    const averageDuration = durations.length > 0 
      ? durations.reduce((a, b) => a + b, 0) / durations.length 
      : 0;

    // Tasa de ocupación (simplificada)
    const { count: totalVehicles } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('is_active', true);

    const totalDays = differenceInDays(parseISO(endDate), parseISO(startDate)) || 1;
    const rentedDays = durations.reduce((a, b) => a + b, 0);
    const occupancyRate = totalVehicles && totalVehicles > 0
      ? (rentedDays / (totalVehicles * totalDays)) * 100
      : 0;

    // Agrupar por estado
    const bookingsByStatus = Object.entries(
      bookings?.reduce((acc: Record<string, number>, b) => {
        acc[b.status] = (acc[b.status] || 0) + 1;
        return acc;
      }, {}) || {}
    ).map(([status, count]) => ({ status, count }));

    // Agrupar por grupo de vehículos
    const bookingsByGroup = Object.entries(
      bookings?.reduce((acc: Record<string, { count: number; revenue: number }>, b: any) => {
        const group = b.vehicle_group?.name || 'Sin grupo';
        if (!acc[group]) acc[group] = { count: 0, revenue: 0 };
        acc[group].count++;
        acc[group].revenue += b.total_price || 0;
        return acc;
      }, {}) || {}
    ).map(([group, data]) => ({ group, ...data }));

    // Agrupar por ubicación
    const bookingsByLocation = Object.entries(
      bookings?.reduce((acc: Record<string, number>, b: any) => {
        const location = b.pickup_location?.name || 'Sin ubicación';
        acc[location] = (acc[location] || 0) + 1;
        return acc;
      }, {}) || {}
    ).map(([location, count]) => ({ location, count }));

    // Agrupar por mes
    const months = eachMonthOfInterval({
      start: parseISO(startDate),
      end: parseISO(endDate),
    });

    const bookingsByMonth = months.map(month => {
      const monthStr = format(month, 'yyyy-MM');
      const monthBookings = bookings?.filter(b => 
        b.pickup_date.startsWith(monthStr)
      ) || [];
      return {
        month: format(month, 'MMM yyyy', { locale: es }),
        count: monthBookings.length,
        revenue: monthBookings.reduce((sum, b) => sum + (b.total_price || 0), 0),
      };
    });

    // Top clientes
    const customerStats = bookings?.reduce((acc: Record<string, { name: string; bookings: number; revenue: number }>, b: any) => {
      const name = b.customer ? `${b.customer.first_name} ${b.customer.last_name}` : 'Desconocido';
      if (!acc[name]) acc[name] = { name, bookings: 0, revenue: 0 };
      acc[name].bookings++;
      acc[name].revenue += b.total_price || 0;
      return acc;
    }, {}) || {};

    const topCustomers = Object.values(customerStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      totalBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue,
      averageBookingValue,
      averageDuration,
      occupancyRate,
      bookingsByStatus,
      bookingsByGroup,
      bookingsByLocation,
      bookingsByMonth,
      topCustomers,
    };
  },

  // ==================== REPORTE DE FLOTA ====================
  async getFleetReport(companyId: string, filters: ReportFilters): Promise<FleetReport> {
    const { startDate, endDate } = filters;

    // Vehículos
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select(`
        id,
        status,
        current_mileage,
        is_active,
        vehicle_group:vehicle_groups(name)
      `)
      .eq('company_id', companyId);

    if (vehiclesError) throw vehiclesError;

    const totalVehicles = vehicles?.length || 0;
    const activeVehicles = vehicles?.filter(v => v.is_active).length || 0;

    // Por estado
    const vehiclesByStatus = Object.entries(
      vehicles?.reduce((acc: Record<string, number>, v) => {
        acc[v.status] = (acc[v.status] || 0) + 1;
        return acc;
      }, {}) || {}
    ).map(([status, count]) => ({ status, count }));

    // Por grupo
    const vehiclesByGroup = Object.entries(
      vehicles?.reduce((acc: Record<string, number>, v: any) => {
        const group = v.vehicle_group?.name || 'Sin grupo';
        acc[group] = (acc[group] || 0) + 1;
        return acc;
      }, {}) || {}
    ).map(([group, count]) => ({ group, count }));

    // Costes de mantenimiento
    const { data: maintenances } = await supabase
      .from('vehicle_maintenance')
      .select('actual_cost')
      .eq('company_id', companyId)
      .eq('status', 'completed')
      .gte('completed_date', startDate)
      .lte('completed_date', endDate);

    const maintenanceCosts = maintenances?.reduce((sum, m) => sum + (m.actual_cost || 0), 0) || 0;

    // Kilometraje promedio
    const mileages = vehicles?.map(v => v.current_mileage || 0) || [];
    const averageMileage = mileages.length > 0
      ? mileages.reduce((a, b) => a + b, 0) / mileages.length
      : 0;

    // Tasa de utilización
    const availableVehicles = vehicles?.filter(v => v.status === 'available').length || 0;
    const utilizationRate = totalVehicles > 0
      ? ((totalVehicles - availableVehicles) / totalVehicles) * 100
      : 0;

    // Vehículos que necesitan mantenimiento
    const { count: vehiclesNeedingMaintenance } = await supabase
      .from('vehicle_maintenance')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .in('status', ['pending', 'scheduled'])
      .lte('scheduled_date', new Date().toISOString().split('T')[0]);

    return {
      totalVehicles,
      activeVehicles,
      vehiclesByStatus,
      vehiclesByGroup,
      maintenanceCosts,
      averageMileage,
      utilizationRate,
      vehiclesNeedingMaintenance: vehiclesNeedingMaintenance || 0,
    };
  },

  // ==================== REPORTE FINANCIERO ====================
  async getFinancialReport(companyId: string, filters: ReportFilters): Promise<FinancialReport> {
    const { startDate, endDate } = filters;

    // Ingresos (reservas pagadas)
    const { data: bookings } = await supabase
      .from('bookings')
      .select('total_price, created_at, vehicle_group:vehicle_groups(name)')
      .eq('company_id', companyId)
      .eq('is_paid', true)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const totalRevenue = bookings?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;

    // Gastos (mantenimientos)
    const { data: maintenances } = await supabase
      .from('vehicle_maintenance')
      .select('actual_cost, maintenance_type, completed_date')
      .eq('company_id', companyId)
      .eq('status', 'completed')
      .gte('completed_date', startDate)
      .lte('completed_date', endDate);

    const totalExpenses = maintenances?.reduce((sum, m) => sum + (m.actual_cost || 0), 0) || 0;

    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Por mes
    const months = eachMonthOfInterval({
      start: parseISO(startDate),
      end: parseISO(endDate),
    });

    const revenueByMonth = months.map(month => {
      const monthStr = format(month, 'yyyy-MM');
      const monthRevenue = bookings
        ?.filter(b => b.created_at.startsWith(monthStr))
        .reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;
      const monthExpenses = maintenances
        ?.filter(m => m.completed_date?.startsWith(monthStr))
        .reduce((sum, m) => sum + (m.actual_cost || 0), 0) || 0;

      return {
        month: format(month, 'MMM yyyy', { locale: es }),
        revenue: monthRevenue,
        expenses: monthExpenses,
        profit: monthRevenue - monthExpenses,
      };
    });

    // Por categoría (grupo de vehículos)
    const categoryRevenue = bookings?.reduce((acc: Record<string, number>, b: any) => {
      const category = b.vehicle_group?.name || 'Otros';
      acc[category] = (acc[category] || 0) + (b.total_price || 0);
      return acc;
    }, {}) || {};

    const revenueByCategory = Object.entries(categoryRevenue)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Gastos por tipo
    const expensesByType = maintenances?.reduce((acc: Record<string, number>, m) => {
      acc[m.maintenance_type] = (acc[m.maintenance_type] || 0) + (m.actual_cost || 0);
      return acc;
    }, {}) || {};

    const topExpenseCategories = Object.entries(expensesByType)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    // Pagos pendientes
    const { data: pendingBookings } = await supabase
      .from('bookings')
      .select('total_price')
      .eq('company_id', companyId)
      .eq('is_paid', false)
      .in('status', ['confirmed', 'in_progress', 'completed']);

    const pendingPayments = pendingBookings?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      revenueByMonth,
      revenueByCategory,
      topExpenseCategories,
      pendingPayments,
      averagePaymentTime: 0, // Requiere más datos
    };
  },

  // ==================== EXPORTACIÓN ====================

  // Exportar a Excel
  exportToExcel(data: any[], filename: string, sheetName = 'Datos'): void {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Ajustar anchos de columna
    const maxWidths = data.reduce((acc: number[], row) => {
      Object.values(row).forEach((val, i) => {
        const len = String(val).length;
        acc[i] = Math.max(acc[i] || 10, len);
      });
      return acc;
    }, []);
    worksheet['!cols'] = maxWidths.map(w => ({ wch: Math.min(w + 2, 50) }));

    XLSX.writeFile(workbook, `${filename}.xlsx`);
  },

  // Exportar a CSV
  exportToCSV(data: any[], filename: string): void {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Exportar a PDF
  exportToPDF(
    title: string,
    data: any[],
    columns: { header: string; dataKey: string }[],
    filename: string,
    options?: {
      orientation?: 'portrait' | 'landscape';
      summary?: { label: string; value: string }[];
    }
  ): void {
    const doc = new jsPDF({
      orientation: options?.orientation || 'portrait',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;

    // Título
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, 20);

    // Fecha de generación
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Generado el ${format(new Date(), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}`,
      margin,
      28
    );

    let startY = 35;

    // Resumen si existe
    if (options?.summary) {
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumen', margin, startY);
      startY += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      options.summary.forEach((item, i) => {
        doc.text(`${item.label}: ${item.value}`, margin, startY + (i * 5));
      });
      startY += options.summary.length * 5 + 10;
    }

    // Tabla
    autoTable(doc, {
      startY,
      head: [columns.map(c => c.header)],
      body: data.map(row => columns.map(c => row[c.dataKey] ?? '')),
      headStyles: {
        fillColor: [0, 102, 204],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      margin: { left: margin, right: margin },
    });

    doc.save(`${filename}.pdf`);
  },

  // Obtener reservas para exportación
  async getBookingsForExport(companyId: string, filters: ReportFilters): Promise<any[]> {
    let query = supabase
      .from('bookings')
      .select(`
        booking_number,
        status,
        pickup_date,
        return_date,
        total_price,
        is_paid,
        customer:customers(first_name, last_name, email, phone),
        vehicle_group:vehicle_groups(name),
        vehicle:vehicles(brand, model, plate),
        pickup_location:locations!bookings_pickup_location_id_fkey(name),
        return_location:locations!bookings_return_location_id_fkey(name)
      `)
      .eq('company_id', companyId)
      .gte('pickup_date', filters.startDate)
      .lte('pickup_date', filters.endDate)
      .order('pickup_date', { ascending: false });

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.vehicleGroupId) query = query.eq('vehicle_group_id', filters.vehicleGroupId);
    if (filters.locationId) query = query.eq('pickup_location_id', filters.locationId);

    const { data, error } = await query;
    if (error) throw error;

    // Formatear para exportación
    return data?.map((b: any) => ({
      'Nº Reserva': b.booking_number,
      'Estado': b.status,
      'Cliente': b.customer ? `${b.customer.first_name} ${b.customer.last_name}` : '',
      'Email': b.customer?.email || '',
      'Teléfono': b.customer?.phone || '',
      'Grupo': b.vehicle_group?.name || '',
      'Vehículo': b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model}` : '',
      'Matrícula': b.vehicle?.plate || '',
      'Recogida': format(parseISO(b.pickup_date), 'dd/MM/yyyy'),
      'Devolución': format(parseISO(b.return_date), 'dd/MM/yyyy'),
      'Ubicación recogida': b.pickup_location?.name || '',
      'Ubicación devolución': b.return_location?.name || '',
      'Total': b.total_price?.toFixed(2) || '0.00',
      'Pagado': b.is_paid ? 'Sí' : 'No',
    })) || [];
  },

  // Obtener clientes para exportación
  async getCustomersForExport(companyId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(c => ({
      'Nombre': c.first_name,
      'Apellidos': c.last_name,
      'Email': c.email,
      'Teléfono': c.phone || '',
      'Documento': `${c.document_type?.toUpperCase() || ''}: ${c.document_number || ''}`,
      'Dirección': c.address || '',
      'Ciudad': c.city || '',
      'País': c.country || '',
      'Carnet': c.license_number || '',
      'Bloqueado': c.is_blocked ? 'Sí' : 'No',
      'Fecha registro': format(parseISO(c.created_at), 'dd/MM/yyyy'),
    })) || [];
  },

  // Obtener vehículos para exportación
  async getVehiclesForExport(companyId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        vehicle_group:vehicle_groups(name),
        current_location:locations(name)
      `)
      .eq('company_id', companyId)
      .order('brand');

    if (error) throw error;

    return data?.map((v: any) => ({
      'Marca': v.brand,
      'Modelo': v.model,
      'Año': v.year,
      'Matrícula': v.plate,
      'VIN': v.vin || '',
      'Grupo': v.vehicle_group?.name || '',
      'Estado': v.status,
      'Combustible': v.fuel_type,
      'Transmisión': v.transmission,
      'Plazas': v.seats,
      'Puertas': v.doors,
      'Kilometraje': v.current_mileage?.toLocaleString() || '',
      'Ubicación': v.current_location?.name || '',
      'Propiedad': v.ownership_type,
      'Activo': v.is_active ? 'Sí' : 'No',
    })) || [];
  },

  // Obtener mantenimientos para exportación
  async getMaintenancesForExport(companyId: string, filters: ReportFilters): Promise<any[]> {
    const { data, error } = await supabase
      .from('vehicle_maintenance')
      .select(`
        *,
        vehicle:vehicles(brand, model, plate)
      `)
      .eq('company_id', companyId)
      .gte('scheduled_date', filters.startDate)
      .lte('scheduled_date', filters.endDate)
      .order('scheduled_date', { ascending: false });

    if (error) throw error;

    return data?.map((m: any) => ({
      'Vehículo': m.vehicle ? `${m.vehicle.brand} ${m.vehicle.model}` : '',
      'Matrícula': m.vehicle?.plate || '',
      'Tipo': m.maintenance_type,
      'Título': m.title,
      'Descripción': m.description || '',
      'Fecha programada': m.scheduled_date ? format(parseISO(m.scheduled_date), 'dd/MM/yyyy') : '',
      'Fecha completado': m.completed_date ? format(parseISO(m.completed_date), 'dd/MM/yyyy') : '',
      'Coste estimado': m.estimated_cost?.toFixed(2) || '',
      'Coste final': m.actual_cost?.toFixed(2) || '',
      'Estado': m.status,
      'Taller': m.workshop_name || '',
    })) || [];
  },
};
