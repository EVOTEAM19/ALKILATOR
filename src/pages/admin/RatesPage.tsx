import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Copy,
  MoreHorizontal,
  Calendar,
  Car,
  CheckCircle2,
  XCircle,
  Filter,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  useRates, 
  useCreateRate, 
  useUpdateRate, 
  useDeleteRate,
  useDuplicateRate 
} from '@/hooks/useRates';
import { useVehicleGroupsAdmin } from '@/hooks/useVehicleGroups';
import type { Rate } from '@/types';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

// Formulario de tarifa (simplificado para el esquema actual)
function RateFormDialog({
  open,
  onOpenChange,
  rate,
  onSave,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rate?: Rate | null;
  onSave: (data: Partial<Rate>) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<Partial<Rate>>({
    name: rate?.name || '',
    description: rate?.description || '',
    valid_from: rate?.valid_from || null,
    valid_until: rate?.valid_until || null,
    online_payment_discount: rate?.online_payment_discount || 0,
    is_active: rate?.is_active ?? true,
    show_on_web: rate?.show_on_web ?? true,
  });
  
  const handleSubmit = () => {
    onSave(formData);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {rate ? 'Editar tarifa' : 'Nueva tarifa'}
          </DialogTitle>
          <DialogDescription>
            {rate 
              ? 'Modifica los datos de la tarifa'
              : 'Crea una nueva tarifa para definir precios'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Basic info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la tarifa *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Tarifa General, Verano 2024"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción de la tarifa..."
                rows={2}
              />
            </div>
          </div>
          
          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha inicio (opcional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formData.valid_from 
                      ? format(parseISO(formData.valid_from), 'dd/MM/yyyy')
                      : 'Sin fecha (tarifa general)'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={formData.valid_from ? parseISO(formData.valid_from) : undefined}
                    onSelect={(date) => setFormData({
                      ...formData,
                      valid_from: date ? format(date, 'yyyy-MM-dd') : null
                    })}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Fecha fin (opcional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formData.valid_until 
                      ? format(parseISO(formData.valid_until), 'dd/MM/yyyy')
                      : 'Sin fecha (tarifa general)'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={formData.valid_until ? parseISO(formData.valid_until) : undefined}
                    onSelect={(date) => setFormData({
                      ...formData,
                      valid_until: date ? format(date, 'yyyy-MM-dd') : null
                    })}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="discount">Descuento pago online (%)</Label>
            <div className="relative">
              <Input
                id="discount"
                type="number"
                step="0.01"
                value={formData.online_payment_discount}
                onChange={(e) => setFormData({ ...formData, online_payment_discount: parseFloat(e.target.value) || 0 })}
                min={0}
                max={100}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="is_active">Tarifa activa</Label>
              <p className="text-sm text-muted-foreground">
                Las tarifas inactivas no se aplican a las reservas
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show_on_web">Mostrar en web</Label>
              <p className="text-sm text-muted-foreground">
                Visible en el motor de reservas público
              </p>
            </div>
            <Switch
              id="show_on_web"
              checked={formData.show_on_web}
              onCheckedChange={(checked) => setFormData({ ...formData, show_on_web: checked })}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!formData.name || isLoading}
          >
            {isLoading ? 'Guardando...' : rate ? 'Guardar cambios' : 'Crear tarifa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Fila de la tabla
function RateRow({ 
  rate, 
  onEdit, 
  onDuplicate,
  onDelete 
}: { 
  rate: Rate;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const hasPrices = rate.prices && rate.prices.length > 0;
  const priceRange = hasPrices 
    ? `${rate.prices[0].daily_price}€ - ${rate.prices[rate.prices.length - 1].daily_price}€`
    : 'Sin precios';
  
  return (
    <TableRow className={cn(!rate.is_active && 'opacity-50')}>
      <TableCell>
        <div>
          <p className="font-medium">{rate.name}</p>
          {rate.description && (
            <p className="text-xs text-muted-foreground">{rate.description}</p>
          )}
          {rate.valid_from && rate.valid_until && (
            <p className="text-xs text-muted-foreground">
              {format(parseISO(rate.valid_from), 'dd MMM', { locale: es })} - {format(parseISO(rate.valid_until), 'dd MMM yyyy', { locale: es })}
            </p>
          )}
          {!rate.valid_from && !rate.valid_until && (
            <Badge variant="outline" className="text-xs mt-1">Tarifa general</Badge>
          )}
        </div>
      </TableCell>
      
      <TableCell>
        <div className="space-y-1">
          {hasPrices ? (
            <>
              <p className="text-sm font-medium">{priceRange}/día</p>
              <p className="text-xs text-muted-foreground">
                {rate.prices.length} grupo{rate.prices.length !== 1 ? 's' : ''}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Sin precios configurados</p>
          )}
        </div>
      </TableCell>
      
      <TableCell>
        {rate.online_payment_discount > 0 && (
          <Badge variant="secondary" className="text-xs">
            -{rate.online_payment_discount}% online
          </Badge>
        )}
      </TableCell>
      
      <TableCell>
        <Badge variant={rate.is_active ? 'default' : 'outline'} className={rate.is_active ? 'bg-secondary' : ''}>
          {rate.is_active ? (
            <>
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Activa
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3 mr-1" />
              Inactiva
            </>
          )}
        </Badge>
      </TableCell>
      
      <TableCell>
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
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export default function RatesPage() {
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  
  const filters = {
    vehicleGroupId: selectedGroup === 'all' ? undefined : selectedGroup,
    isActive: undefined, // Mostrar todas
  };
  
  const { data: rates, isLoading, refetch } = useRates(filters);
  const { data: groups } = useVehicleGroupsAdmin();
  const createMutation = useCreateRate();
  const updateMutation = useUpdateRate();
  const deleteMutation = useDeleteRate();
  const duplicateMutation = useDuplicateRate();
  
  const [showForm, setShowForm] = useState(false);
  const [editingRate, setEditingRate] = useState<Rate | null>(null);
  const [rateToDelete, setRateToDelete] = useState<Rate | null>(null);
  
  const handleSave = async (data: Partial<Rate>) => {
    if (editingRate) {
      await updateMutation.mutateAsync({ id: editingRate.id, updates: data });
    } else {
      await createMutation.mutateAsync(data);
    }
    setShowForm(false);
    setEditingRate(null);
  };
  
  const handleDelete = async () => {
    if (rateToDelete) {
      await deleteMutation.mutateAsync(rateToDelete.id);
      setRateToDelete(null);
    }
  };
  
  const handleDuplicate = async (rate: Rate) => {
    await duplicateMutation.mutateAsync(rate.id);
  };
  
  const openEdit = (rate: Rate) => {
    setEditingRate(rate);
    setShowForm(true);
  };
  
  const openCreate = () => {
    setEditingRate(null);
    setShowForm(true);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tarifas</h1>
          <p className="text-muted-foreground">
            Gestiona los precios de alquiler por grupo y temporada
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={openCreate} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nueva tarifa
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtrar por:</span>
            </div>
            
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los grupos</SelectItem>
                {groups?.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Rates Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-20" />
                </div>
              ))}
            </div>
          ) : rates?.length === 0 ? (
            <div className="p-12 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay tarifas</h3>
              <p className="text-muted-foreground mb-4">
                {selectedGroup !== 'all'
                  ? 'No se encontraron tarifas con los filtros aplicados'
                  : 'Crea tarifas para definir los precios de alquiler'
                }
              </p>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Crear primera tarifa
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarifa</TableHead>
                  <TableHead>Precios</TableHead>
                  <TableHead>Descuentos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates?.map((rate) => (
                  <RateRow
                    key={rate.id}
                    rate={rate}
                    onEdit={() => openEdit(rate)}
                    onDuplicate={() => handleDuplicate(rate)}
                    onDelete={() => setRateToDelete(rate)}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Form Dialog */}
      <RateFormDialog
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingRate(null);
        }}
        rate={editingRate}
        onSave={handleSave}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
      
      {/* Delete Dialog */}
      <ConfirmDialog
        open={!!rateToDelete}
        onOpenChange={(open) => !open && setRateToDelete(null)}
        title="Eliminar tarifa"
        description={`¿Estás seguro de que quieres eliminar la tarifa "${rateToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
