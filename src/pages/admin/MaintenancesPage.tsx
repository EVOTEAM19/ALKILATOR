import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { format, parseISO, isPast, isToday, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Car,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Play,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { 
  useMaintenances, 
  useMaintenanceStats,
  useOverdueMaintenances,
  useCreateMaintenance,
  useUpdateMaintenance,
  useCompleteMaintenance,
  useCancelMaintenance,
  useDeleteMaintenance
} from '@/hooks/useMaintenances';
import { useVehicles } from '@/hooks/useVehicles';
import { MAINTENANCE_TYPE_LABELS } from '@/lib/constants';
import type { MaintenanceFilters, VehicleMaintenance } from '@/types';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

const MAINTENANCE_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  scheduled: 'Programado',
  in_progress: 'En curso',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

const MAINTENANCE_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500 text-white',
  scheduled: 'bg-blue-500 text-white',
  in_progress: 'bg-orange-500 text-white',
  completed: 'bg-green-500 text-white',
  cancelled: 'bg-muted-foreground text-white',
};

// Formulario de mantenimiento
function MaintenanceFormDialog({
  open,
  onOpenChange,
  maintenance,
  onSave,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maintenance?: VehicleMaintenance | null;
  onSave: (data: Partial<VehicleMaintenance>) => void;
  isLoading: boolean;
}) {
  const { data: vehiclesData } = useVehicles({ isActive: true }, 1, 100);
  const vehicles = vehiclesData?.data || [];
  
  const [formData, setFormData] = useState<Partial<VehicleMaintenance>>({
    vehicle_id: maintenance?.vehicle_id || '',
    maintenance_type: maintenance?.maintenance_type || 'revision',
    title: maintenance?.title || '',
    description: maintenance?.description || '',
    scheduled_date: maintenance?.scheduled_date || format(new Date(), 'yyyy-MM-dd'),
    estimated_cost: maintenance?.estimated_cost || 0,
    status: maintenance?.status || 'scheduled',
    notes: maintenance?.notes || '',
    workshop_name: maintenance?.workshop_name || '',
  });
  
  const handleSubmit = () => {
    onSave(formData);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {maintenance ? 'Editar mantenimiento' : 'Programar mantenimiento'}
          </DialogTitle>
          <DialogDescription>
            {maintenance 
              ? 'Modifica los datos del mantenimiento'
              : 'Programa un nuevo mantenimiento para un vehículo'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Vehículo *</Label>
            <Select
              value={formData.vehicle_id}
              onValueChange={(v) => setFormData({ ...formData, vehicle_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un vehículo" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model} - {vehicle.plate}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de mantenimiento *</Label>
              <Select
                value={formData.maintenance_type}
                onValueChange={(v) => setFormData({ ...formData, maintenance_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MAINTENANCE_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Fecha programada *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formData.scheduled_date 
                      ? format(parseISO(formData.scheduled_date), 'dd/MM/yyyy')
                      : 'Seleccionar'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={formData.scheduled_date ? parseISO(formData.scheduled_date) : undefined}
                    onSelect={(date) => setFormData({
                      ...formData,
                      scheduled_date: date ? format(date, 'yyyy-MM-dd') : ''
                    })}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: Revisión general"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalle del mantenimiento..."
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated_cost">Coste estimado (€)</Label>
              <Input
                id="estimated_cost"
                type="number"
                step="0.01"
                value={formData.estimated_cost || ''}
                onChange={(e) => setFormData({ ...formData, estimated_cost: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="workshop">Taller/Proveedor</Label>
              <Input
                id="workshop"
                value={formData.workshop_name}
                onChange={(e) => setFormData({ ...formData, workshop_name: e.target.value })}
                placeholder="Nombre del taller"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select
              value={formData.status}
              onValueChange={(v) => setFormData({ ...formData, status: v as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="scheduled">Programado</SelectItem>
                <SelectItem value="in_progress">En curso</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionales..."
              rows={2}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!formData.vehicle_id || !formData.maintenance_type || !formData.title || !formData.scheduled_date || isLoading}
          >
            {isLoading ? 'Guardando...' : maintenance ? 'Guardar cambios' : 'Programar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Diálogo de completar mantenimiento
function CompleteMaintenanceDialog({
  open,
  onOpenChange,
  maintenance,
  onComplete,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maintenance: VehicleMaintenance | null;
  onComplete: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    completedDate: format(new Date(), 'yyyy-MM-dd'),
    cost: maintenance?.estimated_cost || 0,
    mileageAtService: maintenance?.vehicle?.current_mileage || 0,
    notes: '',
    invoiceNumber: '',
  });
  
  const handleSubmit = () => {
    onComplete(formData);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Completar mantenimiento
          </DialogTitle>
          <DialogDescription>
            Registra los datos finales del mantenimiento
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Fecha de finalización</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  {format(parseISO(formData.completedDate), 'dd/MM/yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={parseISO(formData.completedDate)}
                  onSelect={(date) => setFormData({
                    ...formData,
                    completedDate: date ? format(date, 'yyyy-MM-dd') : formData.completedDate
                  })}
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Coste final (€) *</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mileage">Kilometraje</Label>
              <Input
                id="mileage"
                type="number"
                value={formData.mileageAtService}
                onChange={(e) => setFormData({ ...formData, mileageAtService: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="invoice">Nº Factura</Label>
            <Input
              id="invoice"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
              placeholder="FAC-001"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notas finales</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observaciones del trabajo realizado..."
              rows={2}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!formData.cost || isLoading}
            className="bg-green-500 hover:bg-green-600"
          >
            {isLoading ? 'Procesando...' : 'Completar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Fila de la tabla
function MaintenanceRow({ 
  maintenance, 
  onEdit,
  onComplete,
  onCancel,
  onDelete 
}: { 
  maintenance: VehicleMaintenance;
  onEdit: () => void;
  onComplete: () => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const scheduledDate = maintenance.scheduled_date ? parseISO(maintenance.scheduled_date) : null;
  const isOverdue = scheduledDate && isPast(scheduledDate) && !['completed', 'cancelled'].includes(maintenance.status);
  const isUpcoming = scheduledDate && !isPast(scheduledDate) && scheduledDate <= addDays(new Date(), 7);
  
  return (
    <TableRow className={cn(
      'hover:bg-muted/50',
      isOverdue && 'bg-destructive/5',
      maintenance.status === 'cancelled' && 'opacity-50'
    )}>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Car className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">
              {maintenance.vehicle?.brand} {maintenance.vehicle?.model}
            </p>
            <p className="text-sm text-muted-foreground">{maintenance.vehicle?.plate}</p>
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <Badge variant="outline">
          {MAINTENANCE_TYPE_LABELS[maintenance.maintenance_type] || maintenance.maintenance_type}
        </Badge>
        <p className="text-sm font-medium mt-1">{maintenance.title}</p>
        {maintenance.description && (
          <p className="text-xs text-muted-foreground max-w-[200px] truncate">
            {maintenance.description}
          </p>
        )}
      </TableCell>
      
      <TableCell>
        {scheduledDate && (
          <div className="flex items-center gap-2">
            {isOverdue && <AlertTriangle className="h-4 w-4 text-destructive" />}
            <div>
              <p className={cn(
                'font-medium',
                isOverdue && 'text-destructive',
                isUpcoming && 'text-orange-500'
              )}>
                {format(scheduledDate, 'dd MMM yyyy', { locale: es })}
              </p>
              {isOverdue && (
                <p className="text-xs text-destructive">Atrasado</p>
              )}
            </div>
          </div>
        )}
      </TableCell>
      
      <TableCell>
        {maintenance.status === 'completed' ? (
          <span className="font-medium">{formatPrice(maintenance.actual_cost || 0)}</span>
        ) : (
          <span className="text-muted-foreground">
            ~{formatPrice(maintenance.estimated_cost || 0)}
          </span>
        )}
      </TableCell>
      
      <TableCell>
        <Badge className={cn(MAINTENANCE_STATUS_COLORS[maintenance.status])}>
          {MAINTENANCE_STATUS_LABELS[maintenance.status]}
        </Badge>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-1">
          {maintenance.status !== 'completed' && maintenance.status !== 'cancelled' && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-green-500 hover:text-green-600"
              onClick={onComplete}
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              {maintenance.status !== 'completed' && maintenance.status !== 'cancelled' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onCancel} className="text-destructive">
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function MaintenancesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  
  // Filtros desde URL
  const filters: MaintenanceFilters = useMemo(() => ({
    vehicleId: searchParams.get('vehicle') || undefined,
    maintenanceType: searchParams.get('type') || undefined,
    status: searchParams.get('status') || undefined,
    dateFrom: searchParams.get('from') || undefined,
    dateTo: searchParams.get('to') || undefined,
    search: searchParams.get('search') || undefined,
  }), [searchParams]);
  
  const page = parseInt(searchParams.get('page') || '1');
  
  // Queries
  const { data: maintenancesData, isLoading, refetch } = useMaintenances(filters, page, 20);
  const { data: stats } = useMaintenanceStats();
  const { data: overdueMaintenances } = useOverdueMaintenances();
  
  // Mutations
  const createMutation = useCreateMaintenance();
  const updateMutation = useUpdateMaintenance();
  const completeMutation = useCompleteMaintenance();
  const cancelMutation = useCancelMaintenance();
  const deleteMutation = useDeleteMaintenance();
  
  // State
  const [showForm, setShowForm] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<VehicleMaintenance | null>(null);
  const [completingMaintenance, setCompletingMaintenance] = useState<VehicleMaintenance | null>(null);
  const [maintenanceToDelete, setMaintenanceToDelete] = useState<VehicleMaintenance | null>(null);
  const [maintenanceToCancel, setMaintenanceToCancel] = useState<VehicleMaintenance | null>(null);
  
  // Handlers
  const updateFilters = (newFilters: MaintenanceFilters) => {
    const params = new URLSearchParams();
    if (newFilters.vehicleId) params.set('vehicle', newFilters.vehicleId);
    if (newFilters.maintenanceType) params.set('type', newFilters.maintenanceType);
    if (newFilters.status) params.set('status', newFilters.status as string);
    if (newFilters.dateFrom) params.set('from', newFilters.dateFrom);
    if (newFilters.dateTo) params.set('to', newFilters.dateTo);
    if (newFilters.search) params.set('search', newFilters.search);
    params.set('page', '1');
    setSearchParams(params);
  };
  
  const clearFilters = () => {
    setSearchParams({});
    setSearch('');
  };
  
  const handleSearch = () => {
    updateFilters({ ...filters, search: search || undefined });
  };
  
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };
  
  const handleSave = async (data: Partial<VehicleMaintenance>) => {
    if (editingMaintenance) {
      await updateMutation.mutateAsync({ id: editingMaintenance.id, updates: data });
    } else {
      await createMutation.mutateAsync(data);
    }
    setShowForm(false);
    setEditingMaintenance(null);
  };
  
  const handleComplete = async (data: any) => {
    if (completingMaintenance) {
      await completeMutation.mutateAsync({ id: completingMaintenance.id, data });
      setCompletingMaintenance(null);
    }
  };
  
  const handleCancel = async () => {
    if (maintenanceToCancel) {
      await cancelMutation.mutateAsync({ id: maintenanceToCancel.id });
      setMaintenanceToCancel(null);
    }
  };
  
  const handleDelete = async () => {
    if (maintenanceToDelete) {
      await deleteMutation.mutateAsync(maintenanceToDelete.id);
      setMaintenanceToDelete(null);
    }
  };
  
  const openEdit = (maintenance: VehicleMaintenance) => {
    setEditingMaintenance(maintenance);
    setShowForm(true);
  };
  
  const openCreate = () => {
    setEditingMaintenance(null);
    setShowForm(true);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mantenimientos</h1>
          <p className="text-muted-foreground">
            Gestiona el mantenimiento de tu flota
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={openCreate} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Programar
          </Button>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.pending || 0}</p>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.scheduled || 0}</p>
              <p className="text-xs text-muted-foreground">Programados</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Play className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.inProgress || 0}</p>
              <p className="text-xs text-muted-foreground">En curso</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.completedThisMonth || 0}</p>
              <p className="text-xs text-muted-foreground">Este mes</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.overdueCount || 0}</p>
              <p className="text-xs text-muted-foreground">Atrasados</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatPrice(stats?.totalCostThisMonth || 0)}</p>
              <p className="text-xs text-muted-foreground">Coste mes</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Overdue Alert */}
      {overdueMaintenances && overdueMaintenances.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Tienes <strong>{overdueMaintenances.length}</strong> mantenimiento(s) atrasado(s). 
            Revisa y actualiza su estado.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por matrícula, vehículo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleSearch}>Buscar</Button>
            </div>
            
            <div className="flex gap-2">
              <Select
                value={filters.maintenanceType || 'all'}
                onValueChange={(v) => updateFilters({ ...filters, maintenanceType: v === 'all' ? undefined : v })}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(MAINTENANCE_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={filters.status || 'all'}
                onValueChange={(v) => updateFilters({ ...filters, status: v === 'all' ? undefined : v as any })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(MAINTENANCE_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {Object.values(filters).some(v => v !== undefined) && (
                <Button variant="ghost" size="icon" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-24" />
                </div>
              ))}
            </div>
          ) : maintenancesData?.data.length === 0 ? (
            <div className="p-12 text-center">
              <Wrench className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay mantenimientos</h3>
              <p className="text-muted-foreground mb-4">
                {Object.values(filters).some(v => v !== undefined)
                  ? 'No se encontraron mantenimientos con los filtros aplicados'
                  : 'Programa el primer mantenimiento de tu flota'
                }
              </p>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Programar mantenimiento
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehículo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Coste</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenancesData?.data.map((maintenance) => (
                    <MaintenanceRow
                      key={maintenance.id}
                      maintenance={maintenance}
                      onEdit={() => openEdit(maintenance)}
                      onComplete={() => setCompletingMaintenance(maintenance)}
                      onCancel={() => setMaintenanceToCancel(maintenance)}
                      onDelete={() => setMaintenanceToDelete(maintenance)}
                    />
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {maintenancesData && maintenancesData.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {((page - 1) * 20) + 1} - {Math.min(page * 20, maintenancesData.count)} de {maintenancesData.count}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Página {page} de {maintenancesData.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= maintenancesData.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Dialogs */}
      <MaintenanceFormDialog
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingMaintenance(null);
        }}
        maintenance={editingMaintenance}
        onSave={handleSave}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
      
      <CompleteMaintenanceDialog
        open={!!completingMaintenance}
        onOpenChange={(open) => !open && setCompletingMaintenance(null)}
        maintenance={completingMaintenance}
        onComplete={handleComplete}
        isLoading={completeMutation.isPending}
      />
      
      <ConfirmDialog
        open={!!maintenanceToCancel}
        onOpenChange={(open) => !open && setMaintenanceToCancel(null)}
        title="Cancelar mantenimiento"
        description="¿Estás seguro de que quieres cancelar este mantenimiento?"
        confirmText="Cancelar mantenimiento"
        variant="destructive"
        isLoading={cancelMutation.isPending}
        onConfirm={handleCancel}
      />
      
      <ConfirmDialog
        open={!!maintenanceToDelete}
        onOpenChange={(open) => !open && setMaintenanceToDelete(null)}
        title="Eliminar mantenimiento"
        description="¿Estás seguro de que quieres eliminar este mantenimiento? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
