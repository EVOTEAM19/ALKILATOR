import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyService } from '@/services/companyService';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import type { Company } from '@/types';
import type { CompanySettings, CompanyUser } from '@/services/companyService';

export function useCompany() {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['company', companyId],
    queryFn: () => companyService.getCompany(companyId!),
    enabled: !!companyId,
  });
}

export function useCompanySettings() {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['company', 'settings', companyId],
    queryFn: () => companyService.getSettings(companyId!),
    enabled: !!companyId,
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  const { companyId } = useAuthStore();
  
  return useMutation({
    mutationFn: (updates: Partial<Company>) => 
      companyService.updateCompany(companyId!, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
      toast.success('Datos de empresa actualizados');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar');
    },
  });
}

export function useUpdateCompanySettings() {
  const queryClient = useQueryClient();
  const { companyId } = useAuthStore();
  
  return useMutation({
    mutationFn: (settings: Partial<CompanySettings>) => 
      companyService.updateSettings(companyId!, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['company'] });
      toast.success('Configuración actualizada');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar');
    },
  });
}

export function useCompanyUsers() {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['company', 'users', companyId],
    queryFn: () => companyService.getCompanyUsers(companyId!),
    enabled: !!companyId,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, updates }: { 
      userId: string; 
      updates: Parameters<typeof companyService.updateUser>[1];
    }) => companyService.updateUser(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', 'users'] });
      toast.success('Usuario actualizado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar usuario');
    },
  });
}

export function useInviteUser() {
  const queryClient = useQueryClient();
  const { companyId } = useAuthStore();
  
  return useMutation({
    mutationFn: ({ email, role, firstName, lastName }: { 
      email: string; 
      role: string;
      firstName?: string;
      lastName?: string;
    }) => companyService.inviteUser(companyId!, email, role, firstName, lastName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', 'users'] });
      toast.success('Invitación enviada');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al invitar usuario');
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => companyService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', 'users'] });
      toast.success('Usuario eliminado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar usuario');
    },
  });
}

export function useEmailTemplates() {
  const { companyId } = useAuthStore();
  
  return useQuery({
    queryKey: ['company', 'emailTemplates', companyId],
    queryFn: () => companyService.getEmailTemplates(companyId!),
    enabled: !!companyId,
  });
}

export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ templateId, updates }: { 
      templateId: string; 
      updates: Parameters<typeof companyService.updateEmailTemplate>[1];
    }) => companyService.updateEmailTemplate(templateId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', 'emailTemplates'] });
      toast.success('Plantilla actualizada');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar plantilla');
    },
  });
}
