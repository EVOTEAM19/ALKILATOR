import { supabase } from '@/lib/supabase';
import type { Customer, CustomerFilters, PaginatedResponse } from '@/types';

export const customerService = {
  // Obtener clientes con paginación y filtros
  async getCustomers(
    companyId: string,
    filters: CustomerFilters = {},
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<Customer>> {
    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .eq('company_id', companyId);
    
    // Aplicar filtros
    if (filters.is_blocked !== undefined) {
      query = query.eq('is_blocked', filters.is_blocked);
    }
    if (filters.isBlacklisted !== undefined) {
      query = query.eq('is_blocked', filters.isBlacklisted);
    }
    
    if (filters.search) {
      query = query.or(`
        first_name.ilike.%${filters.search}%,
        last_name.ilike.%${filters.search}%,
        email.ilike.%${filters.search}%,
        phone.ilike.%${filters.search}%,
        document_number.ilike.%${filters.search}%
      `);
    }
    
    // Ordenación
    query = query.order('created_at', { ascending: false });
    
    // Paginación
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      data: data as Customer[],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  },

  // Obtener cliente por ID con estadísticas
  async getCustomerById(id: string): Promise<Customer & { stats?: any }> {
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Obtener estadísticas de reservas
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, total_price, status')
      .eq('customer_id', id);
    
    const stats = {
      totalBookings: bookings?.length || 0,
      completedBookings: bookings?.filter(b => b.status === 'completed').length || 0,
      totalSpent: bookings?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0,
      cancelledBookings: bookings?.filter(b => b.status === 'cancelled').length || 0,
    };
    
    return { ...customer, stats } as Customer & { stats: any };
  },

  // Crear o actualizar cliente
  async createOrUpdateCustomer(data: {
    companyId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    documentType?: string;
    documentNumber?: string;
    birthDate?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    licenseNumber?: string;
    licenseIssueDate?: string;
    licenseCountry?: string;
    notes?: string;
    userId?: string;
  }): Promise<Customer> {
    // Buscar cliente existente por email
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('*')
      .eq('company_id', data.companyId)
      .eq('email', data.email)
      .single();
    
    const customerData = {
      company_id: data.companyId,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone,
      document_type: data.documentType,
      document_number: data.documentNumber,
      birth_date: data.birthDate,
      address: data.address,
      city: data.city,
      postal_code: data.postalCode,
      country: data.country || 'España',
      license_number: data.licenseNumber,
      license_issue_date: data.licenseIssueDate,
      license_country: data.licenseCountry || 'España',
      notes: data.notes,
      user_id: data.userId,
    };
    
    if (existingCustomer) {
      const { data: updated, error } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', existingCustomer.id)
        .select()
        .single();
      
      if (error) throw error;
      return updated as Customer;
    } else {
      const { data: newCustomer, error } = await supabase
        .from('customers')
        .insert(customerData)
        .select()
        .single();
      
      if (error) throw error;
      return newCustomer as Customer;
    }
  },

  // Actualizar cliente
  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Customer;
  },

  // Eliminar cliente
  async deleteCustomer(id: string): Promise<void> {
    // Verificar que no tiene reservas activas
    const { count } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', id)
      .in('status', ['pending', 'confirmed', 'in_progress']);
    
    if (count && count > 0) {
      throw new Error('No se puede eliminar un cliente con reservas activas');
    }
    
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Añadir/quitar de lista negra
  async toggleBlacklist(id: string, isBlacklisted: boolean, reason?: string): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update({ 
        is_blocked: isBlacklisted,
        block_reason: isBlacklisted ? reason : null,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Customer;
  },

  // Obtener reservas del cliente
  async getCustomerBookings(customerId: string, limit = 10) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_number,
        pickup_date,
        return_date,
        total_price,
        status,
        vehicle_group:vehicle_groups(name)
      `)
      .eq('customer_id', customerId)
      .order('pickup_date', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Estadísticas generales de clientes
  async getCustomerStats(companyId: string) {
    const { count: total } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId);
    
    // Nuevos este mes
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const { count: newThisMonth } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .gte('created_at', monthStart);
    
    const { count: blacklisted } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('is_blocked', true);
    
    return {
      total: total || 0,
      individuals: 0, // No hay campo customer_type en el esquema
      businesses: 0,
      blacklisted: blacklisted || 0,
      newThisMonth: newThisMonth || 0,
    };
  },
};
