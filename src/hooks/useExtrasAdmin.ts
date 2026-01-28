import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { extraService } from '@/services/extraService';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import type { Extra } from '@/types';

export function useExtrasAdmin() {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['extras', 'admin', companyId],
    queryFn: () => extraService.getAllExtras(companyId!),
    enabled: !!companyId,
  });
}

export function useCreateExtra() {
  const queryClient = useQueryClient();
  const { companyId } = useAuthStore();
  
  return useMutation({
    mutationFn: (extra: Partial<Extra>) => 
      extraService.createExtra({ ...extra, company_id: companyId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extras'] });
      toast.success('Extra creado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear el extra');
    },
  });
}

export function useUpdateExtra() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Extra> }) => 
      extraService.updateExtra(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extras'] });
      toast.success('Extra actualizado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar el extra');
    },
  });
}

export function useDeleteExtra() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => extraService.deleteExtra(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extras'] });
      toast.success('Extra eliminado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar el extra');
    },
  });
}
