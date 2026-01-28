import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '@/services/bookingService';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import type { BookingFilters, Booking } from '@/types';

export function useBookings(filters: BookingFilters = {}, page = 1, pageSize = 20) {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['bookings', companyId, filters, page, pageSize],
    queryFn: () => bookingService.getBookings(companyId!, filters, page, pageSize),
    enabled: !!companyId,
    keepPreviousData: true,
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingService.getBookingById(id),
    enabled: !!id,
  });
}

export function useTodayBookings() {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['bookings', 'today', companyId],
    queryFn: () => bookingService.getTodayBookings(companyId!),
    enabled: !!companyId,
    refetchInterval: 60000, // Refrescar cada minuto
  });
}

export function useBookingStats() {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['bookings', 'stats', companyId],
    queryFn: () => bookingService.getBookingStats(companyId!),
    enabled: !!companyId,
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ bookingId, status, additionalData }: {
      bookingId: string;
      status: string;
      additionalData?: Partial<Booking>;
    }) => bookingService.updateBookingStatus(bookingId, status, additionalData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', data.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Estado de reserva actualizado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar la reserva');
    },
  });
}

export function useStartRental() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ bookingId, data }: {
      bookingId: string;
      data: Parameters<typeof bookingService.startRental>[1];
    }) => bookingService.startRental(bookingId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', data.id] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Alquiler iniciado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al iniciar el alquiler');
    },
  });
}

export function useCompleteRental() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ bookingId, data }: {
      bookingId: string;
      data: Parameters<typeof bookingService.completeRental>[1];
    }) => bookingService.completeRental(bookingId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', data.id] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Alquiler finalizado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al finalizar el alquiler');
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason: string }) => 
      bookingService.cancelBooking(bookingId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Reserva cancelada');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al cancelar la reserva');
    },
  });
}
