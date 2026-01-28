import { useQuery } from '@tanstack/react-query';
import { vehicleService } from '@/services/vehicleService';
import type { AvailableVehicle } from '@/types';

interface UseAvailableVehiclesParams {
  pickupDate: string | null;
  returnDate: string | null;
  pickupLocationId?: string | null;
  vehicleType?: 'car' | 'van' | null;
  enabled?: boolean;
}

export function useAvailableVehicles({
  pickupDate,
  returnDate,
  pickupLocationId,
  vehicleType,
  enabled = true,
}: UseAvailableVehiclesParams) {
  const query = useQuery({
    queryKey: ['availableVehicles', pickupDate, returnDate, pickupLocationId, vehicleType],
    queryFn: async () => {
      if (!pickupDate || !returnDate) return [];
      
      return vehicleService.getAvailableVehicles({
        pickupDate,
        returnDate,
        pickupLocationId: pickupLocationId || undefined,
        vehicleType: vehicleType || undefined,
      });
    },
    enabled: enabled && !!pickupDate && !!returnDate,
  });

  return {
    vehicles: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
