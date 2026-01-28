import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/services/customerService';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import type { CustomerFilters, Customer } from '@/types';

export function useCustomers(filters: CustomerFilters = {}, page = 1, pageSize = 20) {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['customers', companyId, filters, page, pageSize],
    queryFn: () => customerService.getCustomers(companyId!, filters, page, pageSize),
    enabled: !!companyId,
    keepPreviousData: true,
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerService.getCustomerById(id),
    enabled: !!id,
  });
}

export function useCustomerBookings(customerId: string) {
  return useQuery({
    queryKey: ['customer', customerId, 'bookings'],
    queryFn: () => customerService.getCustomerBookings(customerId),
    enabled: !!customerId,
  });
}

export function useCustomerStats() {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['customers', 'stats', companyId],
    queryFn: () => customerService.getCustomerStats(companyId!),
    enabled: !!companyId,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const { companyId } = useAuthStore();
  
  return useMutation({
    mutationFn: (data: Parameters<typeof customerService.createOrUpdateCustomer>[0]) => 
      customerService.createOrUpdateCustomer({ ...data, companyId: companyId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cliente guardado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al guardar el cliente');
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Customer> }) => 
      customerService.updateCustomer(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', data.id] });
      toast.success('Cliente actualizado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar el cliente');
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => customerService.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cliente eliminado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar el cliente');
    },
  });
}

export function useToggleBlacklist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isBlacklisted, reason }: { id: string; isBlacklisted: boolean; reason?: string }) => 
      customerService.toggleBlacklist(id, isBlacklisted, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', data.id] });
      toast.success(data.is_blocked ? 'Cliente añadido a lista negra' : 'Cliente retirado de lista negra');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar el cliente');
    },
  });
}
