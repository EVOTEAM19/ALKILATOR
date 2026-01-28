import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceService } from '@/services/maintenanceService';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import type { MaintenanceFilters, VehicleMaintenance } from '@/types';

export function useMaintenances(filters: MaintenanceFilters = {}, page = 1, pageSize = 20) {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['maintenances', companyId, filters, page, pageSize],
    queryFn: () => maintenanceService.getMaintenances(companyId!, filters, page, pageSize),
    enabled: !!companyId,
    keepPreviousData: true,
  });
}

export function useMaintenance(id: string) {
  return useQuery({
    queryKey: ['maintenance', id],
    queryFn: () => maintenanceService.getMaintenanceById(id),
    enabled: !!id,
  });
}

export function useMaintenanceStats() {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['maintenances', 'stats', companyId],
    queryFn: () => maintenanceService.getMaintenanceStats(companyId!),
    enabled: !!companyId,
  });
}

export function useUpcomingMaintenances(limit = 10) {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['maintenances', 'upcoming', companyId, limit],
    queryFn: () => maintenanceService.getUpcomingMaintenances(companyId!, limit),
    enabled: !!companyId,
  });
}

export function useOverdueMaintenances() {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['maintenances', 'overdue', companyId],
    queryFn: () => maintenanceService.getOverdueMaintenances(companyId!),
    enabled: !!companyId,
  });
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient();
  const { companyId } = useAuthStore();
  
  return useMutation({
    mutationFn: (maintenance: Partial<VehicleMaintenance>) => 
      maintenanceService.createMaintenance({ ...maintenance, company_id: companyId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Mantenimiento programado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear el mantenimiento');
    },
  });
}

export function useUpdateMaintenance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<VehicleMaintenance> }) => 
      maintenanceService.updateMaintenance(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance', data.id] });
      toast.success('Mantenimiento actualizado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar el mantenimiento');
    },
  });
}

export function useCompleteMaintenance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: Parameters<typeof maintenanceService.completeMaintenance>[1];
    }) => maintenanceService.completeMaintenance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Mantenimiento completado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al completar el mantenimiento');
    },
  });
}

export function useCancelMaintenance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
      maintenanceService.cancelMaintenance(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Mantenimiento cancelado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al cancelar el mantenimiento');
    },
  });
}

export function useDeleteMaintenance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => maintenanceService.deleteMaintenance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      toast.success('Mantenimiento eliminado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar el mantenimiento');
    },
  });
}
