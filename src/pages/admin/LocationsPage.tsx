import { useState } from 'react';
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Building2,
  Phone,
  Clock,
  Car,
  CheckCircle2,
  XCircle,
  Navigation,
  Globe
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
  useLocationsAdmin, 
  useLocationStats,
  useCreateLocation, 
  useUpdateLocation, 
  useDeleteLocation,
  useVehiclesAtLocation
} from '@/hooks/useLocationsAdmin';
import type { Location } from '@/types';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

// Formulario de ubicación
function LocationFormDialog({
  open,
  onOpenChange,
  location,
  onSave,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location?: Location | null;
  onSave: (data: Partial<Location>) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<Partial<Location>>({
    name: location?.name || '',
    address: location?.address || '',
    city: location?.city || '',
    postal_code: location?.postal_code || '',
    country: location?.country || 'España',
    phone: location?.phone || '',
    email: location?.email || '',
    latitude: location?.latitude || null,
    longitude: location?.longitude || null,
    opening_hours: location?.opening_hours || {},
    different_return_fee: location?.different_return_fee || 0,
    is_main: location?.is_main || false,
    is_active: location?.is_active ?? true,
    allows_different_return: location?.allows_different_return ?? true,
  });
  
  const handleSubmit = () => {
    onSave(formData);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {location ? 'Editar ubicación' : 'Nueva ubicación'}
          </DialogTitle>
          <DialogDescription>
            {location 
              ? 'Modifica los datos de la ubicación'
              : 'Añade una nueva ubicación de recogida/devolución'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Basic info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Oficina Central Madrid"
              />
            </div>
          </div>
          
          <Separator />
          
          {/* Address */}
          <div>
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Dirección
            </h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Calle, número..."
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Madrid"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Código postal</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    placeholder="28001"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="España"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitud</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude || ''}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || null })}
                    placeholder="40.416775"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitud</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude || ''}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || null })}
                    placeholder="-3.703790"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Contact */}
          <div>
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contacto
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+34 900 000 000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="oficina@alkilator.com"
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Surcharge */}
          <div className="space-y-2">
            <Label htmlFor="surcharge">Recargo por devolución diferente (€)</Label>
            <Input
              id="surcharge"
              type="number"
              step="0.01"
              value={formData.different_return_fee}
              onChange={(e) => setFormData({ ...formData, different_return_fee: parseFloat(e.target.value) || 0 })}
              min={0}
            />
            <p className="text-xs text-muted-foreground">
              Se aplicará cuando la devolución sea en otra ubicación
            </p>
          </div>
          
          <Separator />
          
          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_main">Oficina principal</Label>
                <p className="text-xs text-muted-foreground">
                  La oficina principal no tiene recargo
                </p>
              </div>
              <Switch
                id="is_main"
                checked={formData.is_main}
                onCheckedChange={(checked) => setFormData({ ...formData, is_main: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allows_different_return">Permitir devolución diferente</Label>
                <p className="text-xs text-muted-foreground">
                  Permite devolver el vehículo en otra ubicación
                </p>
              </div>
              <Switch
                id="allows_different_return"
                checked={formData.allows_different_return}
                onCheckedChange={(checked) => setFormData({ ...formData, allows_different_return: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_active">Ubicación activa</Label>
                <p className="text-xs text-muted-foreground">
                  Las ubicaciones inactivas no aparecen en reservas
                </p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
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
            disabled={!formData.name || isLoading}
          >
            {isLoading ? 'Guardando...' : location ? 'Guardar cambios' : 'Crear ubicación'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Tarjeta de ubicación
function LocationCard({
  location,
  onEdit,
  onDelete,
}: {
  location: Location;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { data: vehicles } = useVehiclesAtLocation(location.id);
  
  return (
    <Card className={cn(!location.is_active && 'opacity-60')}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{location.name}</h3>
                  {location.is_main && (
                    <Badge variant="secondary" className="text-xs">
                      Principal
                    </Badge>
                  )}
                  {!location.is_active && (
                    <Badge variant="outline" className="text-xs">
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactiva
                    </Badge>
                  )}
                </div>
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
                  {location.latitude && location.longitude && (
                    <DropdownMenuItem asChild>
                      <a 
                        href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Ver en mapa
                      </a>
                    </DropdownMenuItem>
                  )}
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
            
            {/* Address */}
            {location.address && (
              <div className="flex items-start gap-2 mt-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  {location.address}
                  {location.city && `, ${location.city}`}
                  {location.postal_code && ` ${location.postal_code}`}
                </span>
              </div>
            )}
            
            {/* Info row */}
            <div className="flex flex-wrap items-center gap-4 mt-3">
              {location.phone && (
                <a 
                  href={`tel:${location.phone}`}
                  className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
                >
                  <Phone className="h-3 w-3" />
                  {location.phone}
                </a>
              )}
              
              {location.different_return_fee > 0 && !location.is_main && (
                <Badge variant="outline" className="text-xs">
                  Recargo: {formatPrice(location.different_return_fee)}
                </Badge>
              )}
              
              {vehicles && vehicles.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <Car className="h-3 w-3 mr-1" />
                  {vehicles.length} vehículos
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LocationsPage() {
  const { data: locations, isLoading } = useLocationsAdmin();
  const { data: stats } = useLocationStats();
  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation();
  const deleteMutation = useDeleteLocation();
  
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);
  
  const handleSave = async (data: Partial<Location>) => {
    if (editingLocation) {
      await updateMutation.mutateAsync({ id: editingLocation.id, updates: data });
    } else {
      await createMutation.mutateAsync(data);
    }
    setShowForm(false);
    setEditingLocation(null);
  };
  
  const handleDelete = async () => {
    if (locationToDelete) {
      await deleteMutation.mutateAsync(locationToDelete.id);
      setLocationToDelete(null);
    }
  };
  
  const openEdit = (location: Location) => {
    setEditingLocation(location);
    setShowForm(true);
  };
  
  const openCreate = () => {
    setEditingLocation(null);
    setShowForm(true);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ubicaciones</h1>
          <p className="text-muted-foreground">
            Gestiona los puntos de recogida y devolución
          </p>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Nueva ubicación
        </Button>
      </div>
      
      {/* Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.total || 0}</p>
              <p className="text-sm text-muted-foreground">Ubicaciones activas</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : locations?.length === 0 ? (
        <Card className="p-12 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No hay ubicaciones</h3>
          <p className="text-muted-foreground mb-4">
            Añade ubicaciones para recogida y devolución de vehículos
          </p>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Crear primera ubicación
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locations?.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              onEdit={() => openEdit(location)}
              onDelete={() => setLocationToDelete(location)}
            />
          ))}
        </div>
      )}
      
      {/* Form Dialog */}
      <LocationFormDialog
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingLocation(null);
        }}
        location={editingLocation}
        onSave={handleSave}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
      
      {/* Delete Dialog */}
      <ConfirmDialog
        open={!!locationToDelete}
        onOpenChange={(open) => !open && setLocationToDelete(null)}
        title="Eliminar ubicación"
        description={`¿Estás seguro de que quieres eliminar la ubicación "${locationToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
