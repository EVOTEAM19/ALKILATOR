import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountingService } from '@/services/accountingService';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

export function useFinancialSummary(month?: Date) {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['accounting', 'summary', companyId, month?.toISOString()],
    queryFn: () => accountingService.getFinancialSummary(companyId!, month),
    enabled: !!companyId,
  });
}

export function useRevenueByMonth(months = 12) {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['accounting', 'revenueByMonth', companyId, months],
    queryFn: () => accountingService.getRevenueByMonth(companyId!, months),
    enabled: !!companyId,
  });
}

export function useRevenueByCategory(startDate?: string, endDate?: string) {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['accounting', 'revenueByCategory', companyId, startDate, endDate],
    queryFn: () => accountingService.getRevenueByCategory(companyId!, startDate, endDate),
    enabled: !!companyId,
  });
}

export function useInvoices(
  filters: Parameters<typeof accountingService.getInvoices>[1] = {},
  page = 1,
  pageSize = 20
) {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['accounting', 'invoices', companyId, filters, page, pageSize],
    queryFn: () => accountingService.getInvoices(companyId!, filters, page, pageSize),
    enabled: !!companyId,
    keepPreviousData: true,
  });
}

export function useYearlyTotals(year?: number) {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['accounting', 'yearly', companyId, year],
    queryFn: () => accountingService.getYearlyTotals(companyId!, year),
    enabled: !!companyId,
  });
}

export function useMarkAsPaid() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ bookingId, paymentMethod }: { bookingId: string; paymentMethod?: string }) => 
      accountingService.markAsPaid(bookingId, paymentMethod),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Pago registrado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al registrar el pago');
    },
  });
}
