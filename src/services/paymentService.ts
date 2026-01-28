import { supabase } from '@/lib/supabase';
import { loadStripe, Stripe } from '@stripe/stripe-js';

// Inicializar Stripe (la clave pública se obtiene del entorno)
let stripePromise: Promise<Stripe | null>;

const getStripe = () => {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.warn('Stripe publishable key not configured');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  created: number;
}

export interface PaymentRecord {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  payment_type: 'booking' | 'deposit' | 'extra' | 'damage' | 'refund';
  payment_method: string;
  payment_intent_id?: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
  created_at: string;
  metadata?: Record<string, any>;
}

export const paymentService = {
  // Obtener instancia de Stripe
  getStripe,

  // Crear intención de pago para una reserva
  async createPaymentIntent(
    bookingId: string,
    amount: number,
    paymentType: 'booking' | 'deposit' = 'booking',
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    // En producción, esto llamaría a tu backend/edge function
    // que se comunica con la API de Stripe de forma segura
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          bookingId,
          amount: Math.round(amount * 100), // Stripe usa centavos
          currency: 'eur',
          paymentType,
          metadata,
        },
      });

      if (error) throw error;
      return data as PaymentIntent;
    } catch (err: any) {
      // Fallback: si la edge function no está disponible, retornar error
      throw new Error(err.message || 'Error al crear la intención de pago. Asegúrate de que la Edge Function esté configurada.');
    }
  },

  // Confirmar pago con Stripe Elements
  async confirmPayment(
    clientSecret: string,
    paymentElement: any,
    returnUrl: string
  ): Promise<{ error?: any; paymentIntent?: any }> {
    const stripe = await getStripe();
    if (!stripe) throw new Error('Stripe not initialized');

    const result = await stripe.confirmPayment({
      elements: paymentElement,
      confirmParams: {
        return_url: returnUrl,
      },
      redirect: 'if_required',
    });

    return result;
  },

  // Confirmar pago con tarjeta guardada
  async confirmPaymentWithSavedCard(
    clientSecret: string,
    paymentMethodId: string
  ): Promise<{ error?: any; paymentIntent?: any }> {
    const stripe = await getStripe();
    if (!stripe) throw new Error('Stripe not initialized');

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethodId,
    });

    return result;
  },

  // Guardar registro de pago en la base de datos
  // Nota: Si no existe tabla payments, se guarda en bookings
  async savePaymentRecord(record: Omit<PaymentRecord, 'id' | 'created_at'>): Promise<PaymentRecord> {
    // Intentar insertar en tabla payments si existe
    const { data, error } = await supabase
      .from('payments')
      .insert(record)
      .select()
      .single();

    // Si la tabla no existe, solo retornamos el record sin guardarlo
    // En producción, deberías crear la tabla payments
    if (error && error.code === '42P01') {
      // Tabla no existe - retornar record simulado
      return {
        id: crypto.randomUUID(),
        ...record,
        created_at: new Date().toISOString(),
      };
    }

    if (error) throw error;
    return data as PaymentRecord;
  },

  // Actualizar estado del pago
  async updatePaymentStatus(
    paymentId: string,
    status: PaymentRecord['status'],
    paymentIntentId?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('payments')
      .update({
        status,
        payment_intent_id: paymentIntentId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId);

    // Si la tabla no existe, no hacer nada
    if (error && error.code === '42P01') {
      return;
    }

    if (error) throw error;
  },

  // Obtener pagos de una reserva
  async getBookingPayments(bookingId: string): Promise<PaymentRecord[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false });

      if (error && error.code === '42P01') {
        // Tabla no existe - retornar array vacío o datos de bookings
        // Por ahora retornamos vacío, pero podrías consultar bookings
        return [];
      }

      if (error) throw error;
      return data as PaymentRecord[];
    } catch (err: any) {
      // Si falla, retornar array vacío
      return [];
    }
  },

  // Marcar reserva como pagada
  async markBookingAsPaid(
    bookingId: string,
    paymentMethod: string,
    paymentIntentId?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('bookings')
      .update({
        is_paid: true,
        paid_at: new Date().toISOString(),
        payment_method: paymentMethod,
      })
      .eq('id', bookingId);

    if (error) throw error;
  },

  // Procesar reembolso
  async processRefund(
    paymentIntentId: string,
    amount?: number, // Si no se especifica, reembolso total
    reason?: string
  ): Promise<{ refundId: string; status: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('process-refund', {
        body: {
          paymentIntentId,
          amount: amount ? Math.round(amount * 100) : undefined,
          reason,
        },
      });

      if (error) throw error;
      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Error al procesar el reembolso. Asegúrate de que la Edge Function esté configurada.');
    }
  },

  // Crear setup intent para guardar tarjeta
  async createSetupIntent(customerId: string): Promise<{ clientSecret: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('create-setup-intent', {
        body: { customerId },
      });

      if (error) throw error;
      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Error al crear setup intent');
    }
  },

  // Obtener métodos de pago guardados del cliente
  async getCustomerPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      const { data, error } = await supabase.functions.invoke('get-payment-methods', {
        body: { customerId },
      });

      if (error) throw error;
      return data?.paymentMethods || [];
    } catch (err: any) {
      // Si falla, retornar array vacío
      return [];
    }
  },

  // Eliminar método de pago
  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('delete-payment-method', {
        body: { paymentMethodId },
      });

      if (error) throw error;
    } catch (err: any) {
      throw new Error(err.message || 'Error al eliminar el método de pago');
    }
  },

  // Calcular comisiones de pago
  calculatePaymentFees(amount: number, method: 'card' | 'transfer' = 'card'): {
    processingFee: number;
    netAmount: number;
  } {
    // Comisiones típicas de Stripe: 1.4% + 0.25€ (Europa)
    const fees = method === 'card'
      ? amount * 0.014 + 0.25
      : 0;

    return {
      processingFee: Math.round(fees * 100) / 100,
      netAmount: Math.round((amount - fees) * 100) / 100,
    };
  },

  // Obtener resumen de pagos para contabilidad
  async getPaymentsSummary(
    companyId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    totalReceived: number;
    totalRefunded: number;
    totalFees: number;
    byMethod: Record<string, number>;
    byType: Record<string, number>;
  }> {
    // Si no existe tabla payments, usar bookings
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('total_price, payment_method, is_paid, paid_at')
        .eq('company_id', companyId)
        .eq('is_paid', true)
        .gte('paid_at', startDate)
        .lte('paid_at', endDate);

      if (error) throw error;

      const result = {
        totalReceived: 0,
        totalRefunded: 0,
        totalFees: 0,
        byMethod: {} as Record<string, number>,
        byType: {} as Record<string, number>,
      };

      bookings?.forEach((booking: any) => {
        result.totalReceived += booking.total_price || 0;
        const method = booking.payment_method || 'unknown';
        result.byMethod[method] = (result.byMethod[method] || 0) + (booking.total_price || 0);
        result.byType['booking'] = (result.byType['booking'] || 0) + (booking.total_price || 0);
        
        // Calcular comisiones aproximadas
        const { processingFee } = this.calculatePaymentFees(booking.total_price || 0, method as 'card' | 'transfer');
        result.totalFees += processingFee;
      });

      return result;
    } catch (err: any) {
      // Retornar valores por defecto si falla
      return {
        totalReceived: 0,
        totalRefunded: 0,
        totalFees: 0,
        byMethod: {},
        byType: {},
      };
    }
  },
};
