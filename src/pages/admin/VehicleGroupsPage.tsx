import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Truck,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  GripVertical,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  useVehicleGroupsAdmin,
  useCreateVehicleGroup,
  useUpdateVehicleGroup,
  useDeleteVehicleGroup,
  useVehicleGroupStats
} from '@/hooks/useVehicleGroups';
import type { VehicleGroup } from '@/types';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

// Componente de formulario de grupo
function GroupFormDialog({
  open,
  onOpenChange,
  group,
  onSave,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: VehicleGroup | null;
  onSave: (data: Partial<VehicleGroup>) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<Partial<VehicleGroup>>({
    name: group?.name || '',
    code: group?.code || '',
    description: group?.description || '',
    vehicle_type: group?.vehicle_type || 'car',
    deposit_amount: group?.deposit_amount || 500,
    km_per_day: group?.km_per_day || 150,
    is_active: group?.is_active ?? true,
    show_on_web: group?.show_on_web ?? true,
    image_url: group?.image_url || '',
  });
  
  // Reset form when group changes
  useState(() => {
    if (group) {
      setFormData({
        name: group.name,
        code: group.code,
        description: group.description || '',
        vehicle_type: group.vehicle_type,
        deposit_amount: group.deposit_amount,
        km_per_day: group.km_per_day || 150,
        is_active: group.is_active,
        show_on_web: group.show_on_web,
        image_url: group.image_url || '',
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        vehicle_type: 'car',
        deposit_amount: 500,
        km_per_day: 150,
        is_active: true,
        show_on_web: true,
        image_url: '',
      });
    }
  });
  
  const handleSubmit = () => {
    onSave(formData);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {group ? 'Editar grupo' : 'Nuevo grupo de vehículos'}
          </DialogTitle>
          <DialogDescription>
            {group 
              ? 'Modifica los datos del grupo de vehículos'
              : 'Crea un nuevo grupo para categorizar tus vehículos'
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
                placeholder="Ej: Económico"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="code">Código *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="Ej: ECO"
                maxLength={10}
                className="uppercase"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción del grupo..."
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de vehículo</Label>
              <Select
                value={formData.vehicle_type}
                onValueChange={(v) => setFormData({ ...formData, vehicle_type: v as 'car' | 'van' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      Coche
                    </div>
                  </SelectItem>
                  <SelectItem value="van">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Furgoneta
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deposit">Fianza (€)</Label>
              <Input
                id="deposit"
                type="number"
                value={formData.deposit_amount}
                onChange={(e) => setFormData({ ...formData, deposit_amount: parseInt(e.target.value) || 0 })}
                min={0}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="km">Km/día por defecto</Label>
            <Input
              id="km"
              type="number"
              value={formData.km_per_day}
              onChange={(e) => setFormData({ ...formData, km_per_day: parseInt(e.target.value) || 0 })}
              min={0}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image">URL de imagen</Label>
            <Input
              id="image"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://..."
              type="url"
            />
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_active">Grupo activo</Label>
                <p className="text-xs text-muted-foreground">
                  Los grupos inactivos no se pueden usar en reservas
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
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!formData.name || !formData.code || isLoading}
          >
            {isLoading ? 'Guardando...' : group ? 'Guardar cambios' : 'Crear grupo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Tarjeta de grupo
function GroupCard({
  group,
  onEdit,
  onDelete,
}: {
  group: VehicleGroup;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { data: stats } = useVehicleGroupStats(group.id);
  
  return (
    <Card className={cn(!group.is_active && 'opacity-60')}>
      {/* Image */}
      <div className="relative h-32 bg-muted">
        {group.image_url ? (
          <img
            src={group.image_url}
            alt={group.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
            {group.vehicle_type === 'car' ? (
              <Car className="h-12 w-12 text-primary/20" />
            ) : (
              <Truck className="h-12 w-12 text-primary/20" />
            )}
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          <Badge variant="secondary">{group.code}</Badge>
          {group.vehicle_type === 'van' && (
            <Badge variant="outline" className="bg-background">Furgoneta</Badge>
          )}
        </div>
        
        {!group.is_active && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            Inactivo
          </Badge>
        )}
        
        {!group.show_on_web && group.is_active && (
          <Badge variant="outline" className="absolute top-2 right-2 bg-background">
            <EyeOff className="h-3 w-3 mr-1" />
            Oculto
          </Badge>
        )}
      </div>
      
      {/* Content */}
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold">{group.name}</h3>
            {group.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {group.description}
              </p>
            )}
          </div>
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
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
                disabled={stats && stats.totalVehicles > 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-sm mb-3">
          <div className="p-2 bg-muted/50 rounded">
            <p className="font-semibold">{stats?.totalVehicles || 0}</p>
            <p className="text-xs text-muted-foreground">Vehículos</p>
          </div>
          <div className="p-2 bg-secondary/10 rounded">
            <p className="font-semibold text-secondary">{stats?.available || 0}</p>
            <p className="text-xs text-muted-foreground">Disponibles</p>
          </div>
          <div className="p-2 bg-orange-500/10 rounded">
            <p className="font-semibold text-orange-500">{stats?.rented || 0}</p>
            <p className="text-xs text-muted-foreground">Alquilados</p>
          </div>
        </div>
        
        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Fianza: <span className="font-medium">{formatPrice(group.deposit_amount)}</span></p>
          <p>Km/día: <span className="font-medium">{group.km_per_day || 150} km</span></p>
        </div>
      </CardContent>
    </Card>
  );
}

// Página principal
export default function VehicleGroupsPage() {
  const { data: groups, isLoading } = useVehicleGroupsAdmin();
  const createMutation = useCreateVehicleGroup();
  const updateMutation = useUpdateVehicleGroup();
  const deleteMutation = useDeleteVehicleGroup();
  
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<VehicleGroup | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<VehicleGroup | null>(null);
  
  const handleSave = async (data: Partial<VehicleGroup>) => {
    if (editingGroup) {
      await updateMutation.mutateAsync({ id: editingGroup.id, updates: data });
    } else {
      await createMutation.mutateAsync(data);
    }
    setShowForm(false);
    setEditingGroup(null);
  };
  
  const handleDelete = async () => {
    if (groupToDelete) {
      await deleteMutation.mutateAsync(groupToDelete.id);
      setGroupToDelete(null);
    }
  };
  
  const openEdit = (group: VehicleGroup) => {
    setEditingGroup(group);
    setShowForm(true);
  };
  
  const openCreate = () => {
    setEditingGroup(null);
    setShowForm(true);
  };
  
  // Separar por tipo de vehículo
  const carGroups = groups?.filter(g => g.vehicle_type === 'car') || [];
  const vanGroups = groups?.filter(g => g.vehicle_type === 'van') || [];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Grupos de vehículos</h1>
          <p className="text-muted-foreground">
            Organiza tu flota en categorías para el motor de reservas
          </p>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo grupo
        </Button>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <div className="h-32 bg-muted animate-pulse" />
              <CardContent className="p-4 space-y-3">
                <div className="h-5 bg-muted rounded animate-pulse w-2/3" />
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-12 bg-muted rounded animate-pulse" />
                  <div className="h-12 bg-muted rounded animate-pulse" />
                  <div className="h-12 bg-muted rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : groups?.length === 0 ? (
        <Card className="p-12 text-center">
          <Car className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No hay grupos</h3>
          <p className="text-muted-foreground mb-4">
            Crea grupos para categorizar tus vehículos
          </p>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Crear primer grupo
          </Button>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Coches */}
          {carGroups.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Car className="h-5 w-5" />
                Coches ({carGroups.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {carGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    onEdit={() => openEdit(group)}
                    onDelete={() => setGroupToDelete(group)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Furgonetas */}
          {vanGroups.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Furgonetas ({vanGroups.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {vanGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    onEdit={() => openEdit(group)}
                    onDelete={() => setGroupToDelete(group)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Form Dialog */}
      <GroupFormDialog
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingGroup(null);
        }}
        group={editingGroup}
        onSave={handleSave}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
      
      {/* Delete Dialog */}
      <ConfirmDialog
        open={!!groupToDelete}
        onOpenChange={(open) => !open && setGroupToDelete(null)}
        title="Eliminar grupo"
        description={`¿Estás seguro de que quieres eliminar el grupo "${groupToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
