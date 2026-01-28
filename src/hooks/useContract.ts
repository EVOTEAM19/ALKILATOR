import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contractService } from '@/services/contractService';
import { toast } from 'sonner';

export function useDownloadContract() {
  return useMutation({
    mutationFn: ({ bookingId, filename }: { bookingId: string; filename?: string }) => 
      contractService.downloadContract(bookingId, filename),
    onSuccess: () => {
      toast.success('Contrato descargado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al generar el contrato');
    },
  });
}

export function useContractPreview() {
  return useMutation({
    mutationFn: (bookingId: string) => 
      contractService.getContractPreviewUrl(bookingId),
    onError: (error: any) => {
      toast.error(error.message || 'Error al generar la vista previa');
    },
  });
}

export function useSaveSignedContract() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ bookingId, signatureData }: { bookingId: string; signatureData: string }) => 
      contractService.saveSignedContract(bookingId, signatureData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast.success('Contrato firmado guardado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al guardar la firma');
    },
  });
}

export function useDownloadChecklist() {
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const blob = await contractService.generateDeliveryChecklist(bookingId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `checklist_${bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast.success('Checklist descargado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al generar el checklist');
    },
  });
}
