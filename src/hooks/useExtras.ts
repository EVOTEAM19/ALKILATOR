import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { extraService } from '@/services/extraService';
import type { Extra } from '@/types';

export function useExtras(companyId?: string) {
  const query = useQuery({
    queryKey: ['extras', companyId],
    queryFn: () => extraService.getExtrasForWeb(companyId),
  });

  return {
    extras: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useExtrasAdmin(companyId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['extras', 'admin', companyId],
    queryFn: () => extraService.getAllExtras(companyId),
    enabled: !!companyId,
  });

  const createMutation = useMutation({
    mutationFn: (extra: Partial<Extra>) => extraService.createExtra({ ...extra, company_id: companyId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extras'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Extra> }) =>
      extraService.updateExtra(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extras'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => extraService.deleteExtra(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extras'] });
    },
  });

  return {
    extras: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createExtra: createMutation.mutateAsync,
    updateExtra: updateMutation.mutateAsync,
    deleteExtra: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
