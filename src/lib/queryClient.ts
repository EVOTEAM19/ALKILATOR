import { QueryClient } from '@tanstack/react-query';

// Configuración optimizada de React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tiempo que los datos se consideran frescos
      staleTime: 1000 * 60 * 5, // 5 minutos

      // Tiempo que los datos inactivos permanecen en cache
      gcTime: 1000 * 60 * 30, // 30 minutos (antes cacheTime)

      // Reintentos en caso de error
      retry: (failureCount, error: unknown) => {
        // No reintentar en errores 4xx
        const status = (error as { status?: number })?.status;
        if (typeof status === 'number' && status >= 400 && status < 500) {
          return false;
        }
        return failureCount < 3;
      },

      // Delay entre reintentos
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch en window focus
      refetchOnWindowFocus: false,

      // Refetch en reconexión
      refetchOnReconnect: true,

      // Refetch en mount si los datos están stale
      refetchOnMount: true,

      // No refetch automático
      refetchInterval: false,

      // Placeholder data para evitar loading states
      placeholderData: (previousData: unknown) => previousData,
    },
    mutations: {
      retry: false,
      networkMode: 'online',
    },
  },
});

// Prefetch de queries comunes
export async function prefetchCommonQueries(companyId: string) {
  await queryClient.prefetchQuery({
    queryKey: ['vehicleGroups', companyId],
    staleTime: 1000 * 60 * 10, // 10 minutos
  });

  await queryClient.prefetchQuery({
    queryKey: ['locations', companyId],
    staleTime: 1000 * 60 * 10,
  });

  await queryClient.prefetchQuery({
    queryKey: ['extras', companyId],
    staleTime: 1000 * 60 * 10,
  });
}

// Invalidar queries selectivamente
export function invalidateBookingQueries(bookingId?: string) {
  queryClient.invalidateQueries({ queryKey: ['bookings'] });
  if (bookingId) {
    queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
  }
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

// Cache persistente (opcional con localforage)
export async function persistQueryCache() {
  // Implementar si se necesita persistencia
}
