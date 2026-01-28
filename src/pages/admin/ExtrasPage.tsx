import { useState } from 'react';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Wifi,
  Baby,
  Navigation,
  Shield,
  User,
  Infinity,
  Snowflake,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff
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
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useExtrasAdmin, useCreateExtra, useUpdateExtra, useDeleteExtra } from '@/hooks/useExtrasAdmin';
import type { Extra } from '@/types';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

const EXTRA_TYPE_LABELS: Record<string, string> = {
  accessory: 'Accesorio',
  service: 'Servicio',
  insurance: 'Protección',
  km_package: 'Paquete km',
  driver: 'Conductor',
};

const EXTRA_TYPE_COLORS: Record<string, string> = {
  accessory: 'bg-blue-500',
  service: 'bg-purple-500',
  insurance: 'bg-green-500',
  km_package: 'bg-orange-500',
  driver: 'bg-pink-500',
};

const EXTRA_ICONS: Record<string, any> = {
  gps: Navigation,
  baby_seat: Baby,
  wifi: Wifi,
  insurance: Shield,
  driver: User,
  km_unlimited: Infinity,
  chains: Snowflake,
};

// Formulario de extra
function ExtraFormDialog({
  open,
  onOpenChange,
  extra,
  onSave,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  extra?: Extra | null;
  onSave: (data: Partial<Extra>) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<Partial<Extra>>({
    name: extra?.name || '',
    description: extra?.description || '',
    extra_type: extra?.extra_type || 'accessory',
    daily_price: extra?.daily_price || 0,
    is_per_rental: extra?.is_per_rental || false,
    max_quantity: extra?.max_quantity || 1,
    is_active: extra?.is_active ?? true,
    show_on_web: extra?.show_on_web ?? true,
    icon: extra?.icon || '',
    display_order: extra?.display_order || 0,
  });
  
  const handleSubmit = () => {
    onSave(formData);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {extra ? 'Editar extra' : 'Nuevo extra'}
          </DialogTitle>
          <DialogDescription>
            {extra 
              ? 'Modifica los datos del extra'
              : 'Crea un nuevo extra o servicio adicional'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: GPS"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Icono</Label>
              <Select
                value={formData.icon || 'default'}
                onValueChange={(v) => setFormData({ ...formData, icon: v === 'default' ? '' : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Por defecto</SelectItem>
                  <SelectItem value="gps">GPS</SelectItem>
                  <SelectItem value="baby_seat">Silla bebé</SelectItem>
                  <SelectItem value="wifi">WiFi</SelectItem>
                  <SelectItem value="insurance">Seguro</SelectItem>
                  <SelectItem value="driver">Conductor</SelectItem>
                  <SelectItem value="km_unlimited">Km ilimitados</SelectItem>
                  <SelectItem value="chains">Cadenas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción del extra..."
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de extra</Label>
              <Select
                value={formData.extra_type}
                onValueChange={(v) => setFormData({ ...formData, extra_type: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EXTRA_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max_quantity">Cantidad máx.</Label>
              <Input
                id="max_quantity"
                type="number"
                value={formData.max_quantity}
                onChange={(e) => setFormData({ ...formData, max_quantity: parseInt(e.target.value) || 1 })}
                min={1}
                max={10}
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio *</Label>
              <div className="relative">
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.daily_price}
                  onChange={(e) => setFormData({ ...formData, daily_price: parseFloat(e.target.value) || 0 })}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Tipo de precio</Label>
              <Select
                value={formData.is_per_rental ? 'per_rental' : 'per_day'}
                onValueChange={(v) => setFormData({ ...formData, is_per_rental: v === 'per_rental' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per_day">Por día</SelectItem>
                  <SelectItem value="per_rental">Por alquiler</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_active">Extra activo</Label>
                <p className="text-xs text-muted-foreground">
                  Los extras inactivos no se pueden añadir a reservas
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
                <p className="text-xs text-muted-foreground">
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
          
          <div className="space-y-2">
            <Label htmlFor="display_order">Orden de visualización</Label>
            <Input
              id="display_order"
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              min={0}
            />
            <p className="text-xs text-muted-foreground">
              Los extras con menor número aparecen primero
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!formData.name || !formData.daily_price || isLoading}
          >
            {isLoading ? 'Guardando...' : extra ? 'Guardar cambios' : 'Crear extra'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Tarjeta de extra
function ExtraCard({
  extra,
  onEdit,
  onDelete,
}: {
  extra: Extra;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const Icon = EXTRA_ICONS[extra.icon || ''] || Package;
  
  return (
    <Card className={cn(!extra.is_active && 'opacity-60')}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={cn(
            'h-12 w-12 rounded-lg flex items-center justify-center shrink-0',
            EXTRA_TYPE_COLORS[extra.extra_type] || 'bg-muted',
            'text-white'
          )}>
            <Icon className="h-6 w-6" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{extra.name}</h3>
                  {!extra.is_active && (
                    <Badge variant="secondary" className="text-xs">
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactivo
                    </Badge>
                  )}
                  {!extra.show_on_web && extra.is_active && (
                    <Badge variant="outline" className="text-xs">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Oculto
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {extra.description || 'Sin descripción'}
                </p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
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
            </div>
            
            <div className="flex items-center gap-4 mt-3">
              <Badge variant="outline">
                {EXTRA_TYPE_LABELS[extra.extra_type]}
              </Badge>
              <span className="text-lg font-bold text-primary">
                {formatPrice(extra.daily_price)}
                <span className="text-sm font-normal text-muted-foreground">
                  /{extra.is_per_rental ? 'alquiler' : 'día'}
                </span>
              </span>
              {extra.max_quantity > 1 && (
                <span className="text-sm text-muted-foreground">
                  Máx: {extra.max_quantity}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ExtrasPage() {
  const { data: extras, isLoading } = useExtrasAdmin();
  const createMutation = useCreateExtra();
  const updateMutation = useUpdateExtra();
  const deleteMutation = useDeleteExtra();
  
  const [showForm, setShowForm] = useState(false);
  const [editingExtra, setEditingExtra] = useState<Extra | null>(null);
  const [extraToDelete, setExtraToDelete] = useState<Extra | null>(null);
  
  const handleSave = async (data: Partial<Extra>) => {
    if (editingExtra) {
      await updateMutation.mutateAsync({ id: editingExtra.id, updates: data });
    } else {
      await createMutation.mutateAsync(data);
    }
    setShowForm(false);
    setEditingExtra(null);
  };
  
  const handleDelete = async () => {
    if (extraToDelete) {
      await deleteMutation.mutateAsync(extraToDelete.id);
      setExtraToDelete(null);
    }
  };
  
  const openEdit = (extra: Extra) => {
    setEditingExtra(extra);
    setShowForm(true);
  };
  
  const openCreate = () => {
    setEditingExtra(null);
    setShowForm(true);
  };
  
  // Agrupar extras por tipo
  const groupedExtras = extras?.reduce((acc: Record<string, Extra[]>, extra) => {
    const type = extra.extra_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(extra);
    return acc;
  }, {}) || {};
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Extras y servicios</h1>
          <p className="text-muted-foreground">
            Gestiona los extras y servicios adicionales disponibles
          </p>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo extra
        </Button>
      </div>
      
      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : extras?.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No hay extras</h3>
          <p className="text-muted-foreground mb-4">
            Crea extras y servicios adicionales para tus reservas
          </p>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Crear primer extra
          </Button>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedExtras).map(([type, typeExtras]) => (
            <div key={type}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className={cn(
                  'h-6 w-6 rounded flex items-center justify-center text-white',
                  EXTRA_TYPE_COLORS[type] || 'bg-muted'
                )}>
                  <Package className="h-4 w-4" />
                </div>
                {EXTRA_TYPE_LABELS[type]} ({typeExtras.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {typeExtras.map((extra) => (
                  <ExtraCard
                    key={extra.id}
                    extra={extra}
                    onEdit={() => openEdit(extra)}
                    onDelete={() => setExtraToDelete(extra)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Form Dialog */}
      <ExtraFormDialog
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingExtra(null);
        }}
        extra={editingExtra}
        onSave={handleSave}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
      
      {/* Delete Dialog */}
      <ConfirmDialog
        open={!!extraToDelete}
        onOpenChange={(open) => !open && setExtraToDelete(null)}
        title="Eliminar extra"
        description={`¿Estás seguro de que quieres eliminar el extra "${extraToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
