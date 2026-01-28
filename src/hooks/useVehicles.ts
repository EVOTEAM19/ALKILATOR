import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleService } from '@/services/vehicleService';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import type { VehicleFilters, Vehicle } from '@/types';

export function useVehicles(filters: VehicleFilters = {}, page = 1, pageSize = 20) {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['vehicles', companyId, filters, page, pageSize],
    queryFn: () => vehicleService.getVehiclesPaginated(companyId!, filters, page, pageSize),
    enabled: !!companyId,
    keepPreviousData: true,
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => vehicleService.getVehicleById(id),
    enabled: !!id,
  });
}

export function useFleetStats() {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['fleet', 'stats', companyId],
    queryFn: () => vehicleService.getFleetStats(companyId!),
    enabled: !!companyId,
  });
}

export function useVehicleHistory(vehicleId: string) {
  return useQuery({
    queryKey: ['vehicle', vehicleId, 'history'],
    queryFn: () => vehicleService.getVehicleBookingHistory(vehicleId),
    enabled: !!vehicleId,
  });
}

export function useVehicleMaintenances(vehicleId: string) {
  return useQuery({
    queryKey: ['vehicle', vehicleId, 'maintenances'],
    queryFn: () => vehicleService.getVehicleMaintenances(vehicleId),
    enabled: !!vehicleId,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  const { companyId } = useAuthStore();
  
  return useMutation({
    mutationFn: (vehicle: Partial<Vehicle>) => 
      vehicleService.createVehicle({ ...vehicle, company_id: companyId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['fleet'] });
      toast.success('Vehículo creado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear el vehículo');
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Vehicle> }) => 
      vehicleService.updateVehicle(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle', data.id] });
      queryClient.invalidateQueries({ queryKey: ['fleet'] });
      toast.success('Vehículo actualizado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar el vehículo');
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => vehicleService.deleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['fleet'] });
      toast.success('Vehículo desactivado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al desactivar el vehículo');
    },
  });
}
