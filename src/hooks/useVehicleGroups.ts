import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleGroupService } from '@/services/vehicleGroupService';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import type { VehicleGroup } from '@/types';

// Hook público (para web)
export function useVehicleGroups(companyId?: string, vehicleType?: string) {
  const query = useQuery({
    queryKey: ['vehicleGroups', companyId, vehicleType],
    queryFn: async () => {
      let q = supabase
        .from('vehicle_groups')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
        .order('name');
      
      if (companyId) {
        q = q.eq('company_id', companyId);
      }
      
      if (vehicleType) {
        q = q.eq('vehicle_type', vehicleType);
      }
      
      const { data, error } = await q;
      
      if (error) throw error;
      return data as VehicleGroup[];
    },
  });
  
  return {
    vehicleGroups: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useVehicleGroup(id: string) {
  const query = useQuery({
    queryKey: ['vehicleGroup', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicle_groups')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as VehicleGroup;
    },
    enabled: !!id,
  });
  
  return {
    vehicleGroup: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}

// Hooks de administración
export function useVehicleGroupsAdmin() {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['vehicleGroups', 'admin', companyId],
    queryFn: () => vehicleGroupService.getGroups(companyId!),
    enabled: !!companyId,
  });
}

export function useVehicleGroupAdmin(id: string) {
  return useQuery({
    queryKey: ['vehicleGroup', id],
    queryFn: () => vehicleGroupService.getGroupById(id),
    enabled: !!id,
  });
}

export function useVehicleGroupStats(groupId: string) {
  return useQuery({
    queryKey: ['vehicleGroup', groupId, 'stats'],
    queryFn: () => vehicleGroupService.getGroupStats(groupId),
    enabled: !!groupId,
  });
}

export function useCreateVehicleGroup() {
  const queryClient = useQueryClient();
  const { companyId } = useAuthStore();
  
  return useMutation({
    mutationFn: (group: Partial<VehicleGroup>) => 
      vehicleGroupService.createGroup({ ...group, company_id: companyId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicleGroups'] });
      toast.success('Grupo creado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear el grupo');
    },
  });
}

export function useUpdateVehicleGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<VehicleGroup> }) => 
      vehicleGroupService.updateGroup(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vehicleGroups'] });
      queryClient.invalidateQueries({ queryKey: ['vehicleGroup', data.id] });
      toast.success('Grupo actualizado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar el grupo');
    },
  });
}

export function useDeleteVehicleGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => vehicleGroupService.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicleGroups'] });
      toast.success('Grupo eliminado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar el grupo');
    },
  });
}
