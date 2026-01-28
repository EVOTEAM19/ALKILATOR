import { useQuery, useMutation } from '@tanstack/react-query';
import { reportService, ReportFilters } from '@/services/reportService';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

export function useBookingsReport(filters: ReportFilters) {
  const { companyId } = useAuthStore();

  return useQuery({
    queryKey: ['reports', 'bookings', companyId, filters],
    queryFn: () => reportService.getBookingsReport(companyId!, filters),
    enabled: !!companyId && !!filters.startDate && !!filters.endDate,
  });
}

export function useFleetReport(filters: ReportFilters) {
  const { companyId } = useAuthStore();

  return useQuery({
    queryKey: ['reports', 'fleet', companyId, filters],
    queryFn: () => reportService.getFleetReport(companyId!, filters),
    enabled: !!companyId && !!filters.startDate && !!filters.endDate,
  });
}

export function useFinancialReport(filters: ReportFilters) {
  const { companyId } = useAuthStore();

  return useQuery({
    queryKey: ['reports', 'financial', companyId, filters],
    queryFn: () => reportService.getFinancialReport(companyId!, filters),
    enabled: !!companyId && !!filters.startDate && !!filters.endDate,
  });
}

export function useExportBookings() {
  const { companyId } = useAuthStore();

  return useMutation({
    mutationFn: async ({ filters, format }: { filters: ReportFilters; format: 'excel' | 'csv' | 'pdf' }) => {
      const data = await reportService.getBookingsForExport(companyId!, filters);
      const filename = `reservas_${filters.startDate}_${filters.endDate}`;

      if (format === 'excel') {
        reportService.exportToExcel(data, filename, 'Reservas');
      } else if (format === 'csv') {
        reportService.exportToCSV(data, filename);
      } else {
        reportService.exportToPDF(
          'Informe de Reservas',
          data,
          [
            { header: 'Nº Reserva', dataKey: 'Nº Reserva' },
            { header: 'Cliente', dataKey: 'Cliente' },
            { header: 'Grupo', dataKey: 'Grupo' },
            { header: 'Recogida', dataKey: 'Recogida' },
            { header: 'Devolución', dataKey: 'Devolución' },
            { header: 'Total', dataKey: 'Total' },
            { header: 'Estado', dataKey: 'Estado' },
          ],
          filename,
          { orientation: 'landscape' }
        );
      }
    },
    onSuccess: () => {
      toast.success('Exportación completada');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al exportar');
    },
  });
}

export function useExportCustomers() {
  const { companyId } = useAuthStore();

  return useMutation({
    mutationFn: async (format: 'excel' | 'csv' | 'pdf') => {
      const data = await reportService.getCustomersForExport(companyId!);
      const filename = `clientes_${new Date().toISOString().split('T')[0]}`;

      if (format === 'excel') {
        reportService.exportToExcel(data, filename, 'Clientes');
      } else if (format === 'csv') {
        reportService.exportToCSV(data, filename);
      } else {
        reportService.exportToPDF(
          'Listado de Clientes',
          data,
          [
            { header: 'Nombre', dataKey: 'Nombre' },
            { header: 'Apellidos', dataKey: 'Apellidos' },
            { header: 'Email', dataKey: 'Email' },
            { header: 'Teléfono', dataKey: 'Teléfono' },
            { header: 'Ciudad', dataKey: 'Ciudad' },
          ],
          filename
        );
      }
    },
    onSuccess: () => {
      toast.success('Exportación completada');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al exportar');
    },
  });
}

export function useExportVehicles() {
  const { companyId } = useAuthStore();

  return useMutation({
    mutationFn: async (format: 'excel' | 'csv' | 'pdf') => {
      const data = await reportService.getVehiclesForExport(companyId!);
      const filename = `flota_${new Date().toISOString().split('T')[0]}`;

      if (format === 'excel') {
        reportService.exportToExcel(data, filename, 'Vehículos');
      } else if (format === 'csv') {
        reportService.exportToCSV(data, filename);
      } else {
        reportService.exportToPDF(
          'Listado de Flota',
          data,
          [
            { header: 'Marca', dataKey: 'Marca' },
            { header: 'Modelo', dataKey: 'Modelo' },
            { header: 'Matrícula', dataKey: 'Matrícula' },
            { header: 'Grupo', dataKey: 'Grupo' },
            { header: 'Estado', dataKey: 'Estado' },
            { header: 'Kilometraje', dataKey: 'Kilometraje' },
          ],
          filename
        );
      }
    },
    onSuccess: () => {
      toast.success('Exportación completada');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al exportar');
    },
  });
}

export function useExportMaintenances() {
  const { companyId } = useAuthStore();

  return useMutation({
    mutationFn: async ({ filters, format }: { filters: ReportFilters; format: 'excel' | 'csv' | 'pdf' }) => {
      const data = await reportService.getMaintenancesForExport(companyId!, filters);
      const filename = `mantenimientos_${filters.startDate}_${filters.endDate}`;

      if (format === 'excel') {
        reportService.exportToExcel(data, filename, 'Mantenimientos');
      } else if (format === 'csv') {
        reportService.exportToCSV(data, filename);
      } else {
        reportService.exportToPDF(
          'Informe de Mantenimientos',
          data,
          [
            { header: 'Vehículo', dataKey: 'Vehículo' },
            { header: 'Matrícula', dataKey: 'Matrícula' },
            { header: 'Tipo', dataKey: 'Tipo' },
            { header: 'Fecha', dataKey: 'Fecha programada' },
            { header: 'Coste', dataKey: 'Coste final' },
            { header: 'Estado', dataKey: 'Estado' },
          ],
          filename
        );
      }
    },
    onSuccess: () => {
      toast.success('Exportación completada');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al exportar');
    },
  });
}
