import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rateService } from '@/services/rateService';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import type { RateFilters, Rate } from '@/types';

export function useRates(filters: RateFilters = {}) {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['rates', companyId, filters],
    queryFn: () => rateService.getRates(companyId!, filters),
    enabled: !!companyId,
  });
}

export function useRate(id: string) {
  return useQuery({
    queryKey: ['rate', id],
    queryFn: () => rateService.getRateById(id),
    enabled: !!id,
  });
}

export function useCreateRate() {
  const queryClient = useQueryClient();
  const { companyId } = useAuthStore();
  
  return useMutation({
    mutationFn: (rate: Partial<Rate>) => 
      rateService.createRate({ ...rate, company_id: companyId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rates'] });
      toast.success('Tarifa creada correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear la tarifa');
    },
  });
}

export function useUpdateRate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Rate> }) => 
      rateService.updateRate(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rates'] });
      queryClient.invalidateQueries({ queryKey: ['rate', data.id] });
      toast.success('Tarifa actualizada correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar la tarifa');
    },
  });
}

export function useDeleteRate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => rateService.deleteRate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rates'] });
      toast.success('Tarifa eliminada correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar la tarifa');
    },
  });
}

export function useDuplicateRate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => rateService.duplicateRate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rates'] });
      toast.success('Tarifa duplicada correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al duplicar la tarifa');
    },
  });
}
