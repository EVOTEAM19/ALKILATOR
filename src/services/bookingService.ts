import { supabase } from '@/lib/supabase';
import type { Booking, BookingExtra, CreateBookingRequest, BookingFilters, PaginatedResponse } from '@/types';

export const bookingService = {
  // Crear una nueva reserva
  async createBooking(data: {
    companyId: string;
    customerId: string;
    vehicleGroupId: string;
    vehicleId?: string;
    pickupLocationId: string;
    returnLocationId: string;
    pickupDate: string;
    pickupTime: string;
    returnDate: string;
    returnTime: string;
    rateId?: string;
    basePrice: number;
    extrasTotal: number;
    locationSurcharge: number;
    discountCode?: string;
    discountAmount: number;
    subtotal: number;
    taxAmount: number;
    totalPrice: number;
    depositAmount: number;
    extras: BookingExtra[];
    notes?: string;
    source?: 'web' | 'manual' | 'phone';
  }): Promise<Booking> {
    // 1. Generar número de reserva
    const { data: bookingNumber, error: numberError } = await supabase
      .rpc('generate_booking_number', { p_company_id: data.companyId });
    
    if (numberError) throw numberError;
    
    // 2. Crear la reserva
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        company_id: data.companyId,
        booking_number: bookingNumber,
        customer_id: data.customerId,
        vehicle_group_id: data.vehicleGroupId,
        vehicle_id: data.vehicleId || null,
        pickup_location_id: data.pickupLocationId,
        return_location_id: data.returnLocationId,
        pickup_date: data.pickupDate,
        pickup_time: data.pickupTime,
        return_date: data.returnDate,
        return_time: data.returnTime,
        rate_id: data.rateId || null,
        base_price: data.basePrice,
        extras_total: data.extrasTotal,
        location_surcharge: data.locationSurcharge,
        discount_code: data.discountCode || null,
        discount_amount: data.discountAmount,
        subtotal: data.subtotal,
        tax_amount: data.taxAmount,
        total_price: data.totalPrice,
        deposit_amount: data.depositAmount,
        notes: data.notes || null,
        source: data.source || 'web',
        status: 'pending',
      })
      .select()
      .single();
    
    if (bookingError) throw bookingError;
    
    // 3. Crear los extras de la reserva
    if (data.extras.length > 0) {
      const extrasToInsert = data.extras.map(extra => ({
        booking_id: booking.id,
        extra_id: extra.extra_id?.startsWith('protection-') ? null : extra.extra_id,
        extra_name: extra.extra_name,
        quantity: extra.quantity,
        unit_price: extra.unit_price,
        total_price: extra.total_price,
        is_per_rental: extra.is_per_rental,
      }));
      
      const { error: extrasError } = await supabase
        .from('booking_extras')
        .insert(extrasToInsert);
      
      if (extrasError) throw extrasError;
    }
    
    // 4. Incrementar uso del código de descuento si aplica
    if (data.discountCode) {
      // Obtener el código actual
      const { data: discountCodeData } = await supabase
        .from('discount_codes')
        .select('current_uses')
        .eq('code', data.discountCode)
        .eq('company_id', data.companyId)
        .single();
      
      if (discountCodeData) {
        await supabase
          .from('discount_codes')
          .update({ current_uses: (discountCodeData.current_uses || 0) + 1 })
          .eq('code', data.discountCode)
          .eq('company_id', data.companyId);
      }
    }
    
    return booking as Booking;
  },
  
  // Obtener reserva por ID
  async getBookingById(id: string): Promise<Booking | null> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(*),
        vehicle:vehicles(*),
        vehicle_group:vehicle_groups(*),
        pickup_location:locations!pickup_location_id(*),
        return_location:locations!return_location_id(*),
        extras:booking_extras(*),
        contract:contracts(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Booking;
  },
  
  // Obtener reserva por número
  async getBookingByNumber(bookingNumber: string): Promise<Booking | null> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(*),
        vehicle:vehicles(*),
        vehicle_group:vehicle_groups(*),
        pickup_location:locations!pickup_location_id(*),
        return_location:locations!return_location_id(*),
        extras:booking_extras(*)
      `)
      .eq('booking_number', bookingNumber)
      .single();
    
    if (error) throw error;
    return data as Booking;
  },
  
  // Validar código de descuento
  async validateDiscountCode(
    companyId: string,
    code: string,
    customerId?: string,
    totalDays?: number,
    amount?: number,
    vehicleGroupId?: string
  ): Promise<{
    isValid: boolean;
    discountType?: string;
    discountValue?: number;
    discountAmount?: number;
    errorMessage?: string;
  }> {
    const { data, error } = await supabase
      .rpc('validate_discount_code', {
        p_company_id: companyId,
        p_code: code,
        p_customer_id: customerId || null,
        p_total_days: totalDays || 1,
        p_amount: amount || 0,
        p_vehicle_group_id: vehicleGroupId || null,
      });
    
    if (error) throw error;
    
    const result = data?.[0];
    return {
      isValid: result?.is_valid || false,
      discountType: result?.discount_type,
      discountValue: result?.discount_value,
      discountAmount: result?.discount_amount,
      errorMessage: result?.error_message,
    };
  },
  
  // Actualizar estado de pago
  async updatePaymentStatus(
    bookingId: string,
    isPaid: boolean,
    paymentMethod: string
  ): Promise<void> {
    const { error } = await supabase
      .from('bookings')
      .update({
        is_paid: isPaid,
        payment_method: paymentMethod,
        paid_at: isPaid ? new Date().toISOString() : null,
      })
      .eq('id', bookingId);
    
    if (error) throw error;
  },
  
  // Cancelar reserva
  async cancelBooking(bookingId: string, reason: string): Promise<void> {
    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
      })
      .eq('id', bookingId);
    
    if (error) throw error;
  },
  
  // Obtener reservas con paginación y filtros
  async getBookings(
    companyId: string,
    filters: BookingFilters = {},
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<Booking>> {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(id, first_name, last_name, email, phone),
        vehicle:vehicles(id, brand, model, plate),
        vehicle_group:vehicle_groups(id, name, code),
        pickup_location:locations!pickup_location_id(id, name),
        return_location:locations!return_location_id(id, name)
      `, { count: 'exact' })
      .eq('company_id', companyId);
    
    // Aplicar filtros
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }
    
    if (filters.location_id) {
      query = query.eq('pickup_location_id', filters.location_id);
    }
    
    if (filters.pickup_date_from) {
      query = query.gte('pickup_date', filters.pickup_date_from);
    }
    
    if (filters.pickup_date_to) {
      query = query.lte('pickup_date', filters.pickup_date_to);
    }
    
    if (filters.search) {
      // Buscar por número de reserva (campo directo)
      query = query.ilike('booking_number', `%${filters.search}%`);
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
      data: data as Booking[],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  },
  
  // Obtener reservas de hoy (recogidas y devoluciones)
  async getTodayBookings(companyId: string): Promise<{
    pickups: Booking[];
    returns: Booking[];
  }> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: pickups, error: pickupsError } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(id, first_name, last_name, phone),
        vehicle:vehicles(id, brand, model, plate),
        vehicle_group:vehicle_groups(id, name),
        pickup_location:locations!pickup_location_id(id, name)
      `)
      .eq('company_id', companyId)
      .eq('pickup_date', today)
      .in('status', ['confirmed', 'pending'])
      .order('pickup_time');
    
    if (pickupsError) throw pickupsError;
    
    const { data: returns, error: returnsError } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(id, first_name, last_name, phone),
        vehicle:vehicles(id, brand, model, plate),
        vehicle_group:vehicle_groups(id, name),
        return_location:locations!return_location_id(id, name)
      `)
      .eq('company_id', companyId)
      .eq('return_date', today)
      .eq('status', 'in_progress')
      .order('return_time');
    
    if (returnsError) throw returnsError;
    
    return {
      pickups: pickups as Booking[],
      returns: returns as Booking[],
    };
  },
  
  // Actualizar estado de reserva
  async updateBookingStatus(
    bookingId: string,
    status: string,
    additionalData?: Partial<Booking>
  ): Promise<Booking> {
    const updateData: any = { status, ...additionalData };
    
    // Añadir timestamps según el estado
    if (status === 'in_progress') {
      updateData.pickup_completed_at = new Date().toISOString();
    } else if (status === 'completed') {
      updateData.return_completed_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)
      .select(`
        *,
        customer:customers(*),
        vehicle:vehicles(*),
        vehicle_group:vehicle_groups(*),
        pickup_location:locations!pickup_location_id(*),
        return_location:locations!return_location_id(*),
        extras:booking_extras(*)
      `)
      .single();
    
    if (error) throw error;
    return data as Booking;
  },
  
  // Iniciar alquiler (entrega del vehículo)
  async startRental(
    bookingId: string,
    data: {
      vehicleId: string;
      pickupMileage: number;
      pickupFuelLevel: number;
      pickupNotes?: string;
      pickupPhotos?: string[];
    }
  ): Promise<Booking> {
    return this.updateBookingStatus(bookingId, 'in_progress', {
      vehicle_id: data.vehicleId,
      pickup_mileage: data.pickupMileage,
      pickup_fuel_level: data.pickupFuelLevel,
      pickup_notes: data.pickupNotes,
      pickup_photos: data.pickupPhotos,
    });
  },
  
  // Finalizar alquiler (devolución del vehículo)
  async completeRental(
    bookingId: string,
    data: {
      returnMileage: number;
      returnFuelLevel: number;
      returnNotes?: string;
      returnPhotos?: string[];
      additionalCharges?: {
        damages?: number;
        fuel?: number;
        cleaning?: number;
        extraKm?: number;
        lateReturn?: number;
      };
    }
  ): Promise<Booking> {
    const additionalData: any = {
      return_mileage: data.returnMileage,
      return_fuel_level: data.returnFuelLevel,
      return_notes: data.returnNotes,
      return_photos: data.returnPhotos,
    };
    
    if (data.additionalCharges) {
      additionalData.damage_charges = data.additionalCharges.damages || 0;
      additionalData.fuel_charges = data.additionalCharges.fuel || 0;
      additionalData.cleaning_charges = data.additionalCharges.cleaning || 0;
      additionalData.extra_km_charges = data.additionalCharges.extraKm || 0;
      additionalData.late_return_charges = data.additionalCharges.lateReturn || 0;
      
      // Calcular total de cargos adicionales
      additionalData.total_additional_charges = 
        additionalData.damage_charges +
        additionalData.fuel_charges +
        additionalData.cleaning_charges +
        additionalData.extra_km_charges +
        additionalData.late_return_charges;
      
      // Actualizar precio total
      additionalData.total_price = 
        (additionalData.subtotal || 0) + 
        (additionalData.tax_amount || 0) + 
        additionalData.total_additional_charges;
    }
    
    return this.updateBookingStatus(bookingId, 'completed', additionalData);
  },
  
  // Obtener estadísticas de reservas
  async getBookingStats(companyId: string): Promise<{
    pending: number;
    confirmed: number;
    inProgress: number;
    completedToday: number;
    cancelledThisMonth: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    
    const { count: pending } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'pending');
    
    const { count: confirmed } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'confirmed');
    
    const { count: inProgress } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'in_progress');
    
    const { count: completedToday } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'completed')
      .gte('return_completed_at', today);
    
    const { count: cancelledThisMonth } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'cancelled')
      .gte('updated_at', monthStart);
    
    return {
      pending: pending || 0,
      confirmed: confirmed || 0,
      inProgress: inProgress || 0,
      completedToday: completedToday || 0,
      cancelledThisMonth: cancelledThisMonth || 0,
    };
  },
};
