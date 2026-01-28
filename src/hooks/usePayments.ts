import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '@/services/paymentService';
import { toast } from 'sonner';

export function useBookingPayments(bookingId: string) {
  return useQuery({
    queryKey: ['payments', 'booking', bookingId],
    queryFn: () => paymentService.getBookingPayments(bookingId),
    enabled: !!bookingId,
  });
}

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: ({
      bookingId,
      amount,
      paymentType,
      metadata,
    }: {
      bookingId: string;
      amount: number;
      paymentType?: 'booking' | 'deposit';
      metadata?: Record<string, any>;
    }) => paymentService.createPaymentIntent(bookingId, amount, paymentType, metadata),
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear el pago');
    },
  });
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientSecret,
      paymentElement,
      returnUrl,
    }: {
      clientSecret: string;
      paymentElement: any;
      returnUrl: string;
    }) => {
      const result = await paymentService.confirmPayment(
        clientSecret,
        paymentElement,
        returnUrl
      );
      if (result.error) throw result.error;
      return result.paymentIntent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Pago procesado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al procesar el pago');
    },
  });
}

export function useMarkAsPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      paymentMethod,
      paymentIntentId,
    }: {
      bookingId: string;
      paymentMethod: string;
      paymentIntentId?: string;
    }) => paymentService.markBookingAsPaid(bookingId, paymentMethod, paymentIntentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['accounting'] });
      toast.success('Pago registrado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al registrar el pago');
    },
  });
}

export function useProcessRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      paymentIntentId,
      amount,
      reason,
    }: {
      paymentIntentId: string;
      amount?: number;
      reason?: string;
    }) => paymentService.processRefund(paymentIntentId, amount, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Reembolso procesado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al procesar el reembolso');
    },
  });
}

export function useCustomerPaymentMethods(customerId: string) {
  return useQuery({
    queryKey: ['paymentMethods', customerId],
    queryFn: () => paymentService.getCustomerPaymentMethods(customerId),
    enabled: !!customerId,
  });
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentMethodId: string) =>
      paymentService.deletePaymentMethod(paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      toast.success('Método de pago eliminado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar el método de pago');
    },
  });
}

export function usePaymentsSummary(companyId: string, startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['payments', 'summary', companyId, startDate, endDate],
    queryFn: () => paymentService.getPaymentsSummary(companyId, startDate, endDate),
    enabled: !!companyId && !!startDate && !!endDate,
  });
}
