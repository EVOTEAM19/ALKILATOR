import { supabase } from '@/lib/supabase';
import { startOfMonth, endOfMonth, subMonths, format, startOfYear, endOfYear } from 'date-fns';

export interface FinancialSummary {
  revenue: number;
  revenueChange: number;
  expenses: number;
  expensesChange: number;
  profit: number;
  profitMargin: number;
  bookingsCount: number;
  averageBookingValue: number;
  pendingPayments: number;
  pendingPaymentsCount: number;
}

export interface RevenueByPeriod {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
  bookings: number;
}

export interface RevenueByCategory {
  category: string;
  amount: number;
  percentage: number;
}

export interface Invoice {
  id: string;
  booking_number: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  tax_amount: number;
  total: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  issue_date: string;
  due_date: string;
  paid_date?: string;
}

export const accountingService = {
  // Obtener resumen financiero del mes actual
  async getFinancialSummary(companyId: string, month?: Date): Promise<FinancialSummary> {
    const targetMonth = month || new Date();
    const monthStart = startOfMonth(targetMonth);
    const monthEnd = endOfMonth(targetMonth);
    const prevMonthStart = startOfMonth(subMonths(targetMonth, 1));
    const prevMonthEnd = endOfMonth(subMonths(targetMonth, 1));
    
    // Ingresos este mes (reservas pagadas)
    const { data: currentRevenue } = await supabase
      .from('bookings')
      .select('total_price, is_paid')
      .eq('company_id', companyId)
      .eq('is_paid', true)
      .gte('created_at', monthStart.toISOString())
      .lte('created_at', monthEnd.toISOString());
    
    const revenue = currentRevenue?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;
    
    // Ingresos mes anterior
    const { data: prevRevenue } = await supabase
      .from('bookings')
      .select('total_price')
      .eq('company_id', companyId)
      .eq('is_paid', true)
      .gte('created_at', prevMonthStart.toISOString())
      .lte('created_at', prevMonthEnd.toISOString());
    
    const prevRevenueTotal = prevRevenue?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;
    
    // Gastos este mes (mantenimientos)
    const { data: currentExpenses } = await supabase
      .from('vehicle_maintenance')
      .select('actual_cost')
      .eq('company_id', companyId)
      .eq('status', 'completed')
      .gte('completed_date', monthStart.toISOString().split('T')[0])
      .lte('completed_date', monthEnd.toISOString().split('T')[0]);
    
    const expenses = currentExpenses?.reduce((sum, m) => sum + (m.actual_cost || 0), 0) || 0;
    
    // Gastos mes anterior
    const { data: prevExpenses } = await supabase
      .from('vehicle_maintenance')
      .select('actual_cost')
      .eq('company_id', companyId)
      .eq('status', 'completed')
      .gte('completed_date', prevMonthStart.toISOString().split('T')[0])
      .lte('completed_date', prevMonthEnd.toISOString().split('T')[0]);
    
    const prevExpensesTotal = prevExpenses?.reduce((sum, m) => sum + (m.actual_cost || 0), 0) || 0;
    
    // Reservas este mes
    const { count: bookingsCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .gte('created_at', monthStart.toISOString())
      .lte('created_at', monthEnd.toISOString());
    
    // Pagos pendientes
    const { data: pendingData } = await supabase
      .from('bookings')
      .select('total_price')
      .eq('company_id', companyId)
      .eq('is_paid', false)
      .in('status', ['confirmed', 'in_progress', 'completed']);
    
    const pendingPayments = pendingData?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;
    
    // Calcular cambios porcentuales
    const calcChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };
    
    const profit = revenue - expenses;
    
    return {
      revenue,
      revenueChange: calcChange(revenue, prevRevenueTotal),
      expenses,
      expensesChange: calcChange(expenses, prevExpensesTotal),
      profit,
      profitMargin: revenue > 0 ? Math.round((profit / revenue) * 100) : 0,
      bookingsCount: bookingsCount || 0,
      averageBookingValue: bookingsCount ? Math.round(revenue / bookingsCount) : 0,
      pendingPayments,
      pendingPaymentsCount: pendingData?.length || 0,
    };
  },

  // Obtener ingresos por mes (últimos 12 meses)
  async getRevenueByMonth(companyId: string, months = 12): Promise<RevenueByPeriod[]> {
    const result: RevenueByPeriod[] = [];
    
    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      // Ingresos
      const { data: revenueData } = await supabase
        .from('bookings')
        .select('total_price')
        .eq('company_id', companyId)
        .eq('is_paid', true)
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString());
      
      // Gastos
      const { data: expensesData } = await supabase
        .from('vehicle_maintenance')
        .select('actual_cost')
        .eq('company_id', companyId)
        .eq('status', 'completed')
        .gte('completed_date', monthStart.toISOString().split('T')[0])
        .lte('completed_date', monthEnd.toISOString().split('T')[0]);
      
      // Reservas
      const { count: bookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString());
      
      const revenue = revenueData?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;
      const expenses = expensesData?.reduce((sum, m) => sum + (m.actual_cost || 0), 0) || 0;
      
      result.push({
        period: format(date, 'MMM yy'),
        revenue,
        expenses,
        profit: revenue - expenses,
        bookings: bookingsCount || 0,
      });
    }
    
    return result;
  },

  // Obtener ingresos por categoría (grupo de vehículos)
  async getRevenueByCategory(companyId: string, startDate?: string, endDate?: string): Promise<RevenueByCategory[]> {
    const start = startDate || startOfMonth(new Date()).toISOString();
    const end = endDate || endOfMonth(new Date()).toISOString();
    
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        total_price,
        vehicle_group:vehicle_groups(name)
      `)
      .eq('company_id', companyId)
      .eq('is_paid', true)
      .gte('created_at', start)
      .lte('created_at', end);
    
    if (error) throw error;
    
    // Agrupar por categoría
    const grouped = data?.reduce((acc: Record<string, number>, booking: any) => {
      const category = booking.vehicle_group?.name || 'Sin categoría';
      acc[category] = (acc[category] || 0) + (booking.total_price || 0);
      return acc;
    }, {}) || {};
    
    const total = Object.values(grouped).reduce((sum, val) => sum + val, 0);
    
    return Object.entries(grouped)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  },

  // Obtener facturas/reservas para facturación
  async getInvoices(
    companyId: string,
    filters: {
      status?: string;
      dateFrom?: string;
      dateTo?: string;
      search?: string;
    } = {},
    page = 1,
    pageSize = 20
  ) {
    let query = supabase
      .from('bookings')
      .select(`
        id,
        booking_number,
        total_price,
        tax_amount,
        is_paid,
        paid_at,
        created_at,
        pickup_date,
        status,
        customer:customers(first_name, last_name, email, tax_id)
      `, { count: 'exact' })
      .eq('company_id', companyId)
      .neq('status', 'cancelled');
    
    if (filters.status === 'paid') {
      query = query.eq('is_paid', true);
    } else if (filters.status === 'pending') {
      query = query.eq('is_paid', false);
    }
    
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    
    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }
    
    if (filters.search) {
      query = query.ilike('booking_number', `%${filters.search}%`);
    }
    
    query = query.order('created_at', { ascending: false });
    
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      data: data?.map((b: any) => ({
        id: b.id,
        booking_number: b.booking_number,
        customer_name: `${b.customer?.first_name || ''} ${b.customer?.last_name || ''}`.trim(),
        customer_email: b.customer?.email,
        customer_tax_id: b.customer?.tax_id,
        amount: b.total_price - (b.tax_amount || 0),
        tax_amount: b.tax_amount || 0,
        total: b.total_price,
        status: b.is_paid ? 'paid' : 'pending',
        issue_date: b.created_at,
        due_date: b.pickup_date,
        paid_date: b.paid_at,
      })),
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  },

  // Marcar como pagado
  async markAsPaid(bookingId: string, paymentMethod?: string): Promise<void> {
    const { error } = await supabase
      .from('bookings')
      .update({
        is_paid: true,
        paid_at: new Date().toISOString(),
        payment_method: paymentMethod || 'other',
      })
      .eq('id', bookingId);
    
    if (error) throw error;
  },

  // Obtener totales anuales
  async getYearlyTotals(companyId: string, year?: number) {
    const targetYear = year || new Date().getFullYear();
    const yearStart = startOfYear(new Date(targetYear, 0, 1));
    const yearEnd = endOfYear(new Date(targetYear, 0, 1));
    
    // Ingresos totales
    const { data: revenueData } = await supabase
      .from('bookings')
      .select('total_price')
      .eq('company_id', companyId)
      .eq('is_paid', true)
      .gte('created_at', yearStart.toISOString())
      .lte('created_at', yearEnd.toISOString());
    
    // Gastos totales
    const { data: expensesData } = await supabase
      .from('vehicle_maintenance')
      .select('actual_cost')
      .eq('company_id', companyId)
      .eq('status', 'completed')
      .gte('completed_date', yearStart.toISOString().split('T')[0])
      .lte('completed_date', yearEnd.toISOString().split('T')[0]);
    
    // Total reservas
    const { count: bookingsCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .gte('created_at', yearStart.toISOString())
      .lte('created_at', yearEnd.toISOString());
    
    const revenue = revenueData?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;
    const expenses = expensesData?.reduce((sum, m) => sum + (m.actual_cost || 0), 0) || 0;
    
    return {
      year: targetYear,
      revenue,
      expenses,
      profit: revenue - expenses,
      bookingsCount: bookingsCount || 0,
    };
  },
};
