import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { discountService } from '@/services/discountService';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import type { DiscountFilters, DiscountCode } from '@/types';

export function useDiscounts(filters: DiscountFilters = {}) {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['discounts', companyId, filters],
    queryFn: () => discountService.getDiscounts(companyId!, filters),
    enabled: !!companyId,
  });
}

export function useDiscount(id: string) {
  return useQuery({
    queryKey: ['discount', id],
    queryFn: () => discountService.getDiscountById(id),
    enabled: !!id,
  });
}

export function useDiscountStats() {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['discounts', 'stats', companyId],
    queryFn: () => discountService.getDiscountStats(companyId!),
    enabled: !!companyId,
  });
}

export function useCreateDiscount() {
  const queryClient = useQueryClient();
  const { companyId } = useAuthStore();
  
  return useMutation({
    mutationFn: (discount: Partial<DiscountCode>) => 
      discountService.createDiscount({ ...discount, company_id: companyId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      toast.success('Código de descuento creado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear el código');
    },
  });
}

export function useUpdateDiscount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DiscountCode> }) => 
      discountService.updateDiscount(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      toast.success('Código de descuento actualizado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar el código');
    },
  });
}

export function useDeleteDiscount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => discountService.deleteDiscount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      toast.success('Código de descuento eliminado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar el código');
    },
  });
}

export function useGenerateCode() {
  return {
    generate: (length?: number) => discountService.generateCode(length),
  };
}
