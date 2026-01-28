import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationService } from '@/services/locationService';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import type { LocationFilters, Location } from '@/types';

export function useLocationsAdmin(filters: LocationFilters = {}) {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['locations', 'admin', companyId, filters],
    queryFn: () => locationService.getLocations(companyId!, filters),
    enabled: !!companyId,
  });
}

export function useLocation(id: string) {
  return useQuery({
    queryKey: ['location', id],
    queryFn: () => locationService.getLocationById(id),
    enabled: !!id,
  });
}

export function useLocationStats() {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['locations', 'stats', companyId],
    queryFn: () => locationService.getLocationStats(companyId!),
    enabled: !!companyId,
  });
}

export function useVehiclesAtLocation(locationId: string) {
  return useQuery({
    queryKey: ['location', locationId, 'vehicles'],
    queryFn: () => locationService.getVehiclesAtLocation(locationId),
    enabled: !!locationId,
  });
}

export function useCreateLocation() {
  const queryClient = useQueryClient();
  const { companyId } = useAuthStore();
  
  return useMutation({
    mutationFn: (location: Partial<Location>) => 
      locationService.createLocation({ ...location, company_id: companyId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Ubicación creada correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear la ubicación');
    },
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Location> }) => 
      locationService.updateLocation(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['location', data.id] });
      toast.success('Ubicación actualizada correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar la ubicación');
    },
  });
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => locationService.deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Ubicación eliminada correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar la ubicación');
    },
  });
}
