import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';
import { useAuthStore } from '@/stores/authStore';

export function useDashboardStats() {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['dashboard', 'stats', companyId],
    queryFn: () => dashboardService.getStats(companyId!),
    enabled: !!companyId,
    refetchInterval: 60000, // Refrescar cada minuto
  });
}

export function useBookingsByStatus() {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['dashboard', 'bookingsByStatus', companyId],
    queryFn: () => dashboardService.getBookingsByStatus(companyId!),
    enabled: !!companyId,
  });
}

export function useRevenueByMonth() {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['dashboard', 'revenueByMonth', companyId],
    queryFn: () => dashboardService.getRevenueByMonth(companyId!),
    enabled: !!companyId,
  });
}

export function useRecentBookings(limit = 5) {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['dashboard', 'recentBookings', companyId, limit],
    queryFn: () => dashboardService.getRecentBookings(companyId!, limit),
    enabled: !!companyId,
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });
}

export function useUpcomingMaintenance(limit = 5) {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['dashboard', 'upcomingMaintenance', companyId, limit],
    queryFn: () => dashboardService.getUpcomingMaintenance(companyId!, limit),
    enabled: !!companyId,
  });
}
