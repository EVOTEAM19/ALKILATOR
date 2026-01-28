import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  Car,
  Edit,
  Trash2,
  MoreHorizontal,
  Fuel,
  Settings2,
  MapPin,
  Gauge,
  Calendar,
  User,
  Wrench,
  FileText,
  History,
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  Info,
  Camera
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  useVehicle, 
  useVehicleHistory, 
  useVehicleMaintenances,
  useDeleteVehicle,
  useUpdateVehicle 
} from '@/hooks/useVehicles';
import { 
  VEHICLE_STATUS_LABELS, 
  VEHICLE_STATUS_COLORS,
  FUEL_TYPE_LABELS,
  TRANSMISSION_LABELS,
  OWNERSHIP_TYPE_LABELS,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
  MAINTENANCE_TYPE_LABELS
} from '@/lib/constants';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

// Componente de información
function InfoItem({ 
  label, 
  value, 
  icon: Icon 
}: { 
  label: string; 
  value: string | number | React.ReactNode; 
  icon?: any;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      {Icon && (
        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

// Lista de características
function FeaturesList({ features }: { features: string[] }) {
  const featureLabels: Record<string, string> = {
    air_conditioning: 'Aire acondicionado',
    bluetooth: 'Bluetooth',
    gps: 'GPS integrado',
    usb: 'Puerto USB',
    cruise_control: 'Control de crucero',
    parking_sensors: 'Sensores de aparcamiento',
    backup_camera: 'Cámara trasera',
    heated_seats: 'Asientos calefactados',
    leather_seats: 'Asientos de cuero',
    sunroof: 'Techo solar',
    android_auto: 'Android Auto',
    apple_carplay: 'Apple CarPlay',
    keyless_entry: 'Entrada sin llave',
    child_seat_anchor: 'Anclaje Isofix',
  };
  
  if (!features || features.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Sin características registradas</p>
    );
  }
  
  return (
    <div className="flex flex-wrap gap-2">
      {features.map((feature) => (
        <Badge key={feature} variant="secondary">
          {featureLabels[feature] || feature}
        </Badge>
      ))}
    </div>
  );
}

// Historial de reservas
function BookingHistory({ vehicleId }: { vehicleId: string }) {
  const { data: bookings, isLoading } = useVehicleHistory(vehicleId);
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }
  
  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-muted-foreground">Sin reservas registradas</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {bookings.map((booking: any) => (
        <Link
          key={booking.id}
          to={`/admin/reservas/${booking.id}`}
          className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
        >
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">
                {booking.customer?.first_name} {booking.customer?.last_name}
              </span>
              <Badge variant="outline" className="text-xs shrink-0">
                {booking.booking_number}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {format(parseISO(booking.pickup_date), 'dd MMM', { locale: es })} - {format(parseISO(booking.return_date), 'dd MMM yyyy', { locale: es })}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-medium">{formatPrice(booking.total_price)}</p>
            <Badge className={cn('text-xs', BOOKING_STATUS_COLORS[booking.status])}>
              {BOOKING_STATUS_LABELS[booking.status]}
            </Badge>
          </div>
        </Link>
      ))}
    </div>
  );
}

// Historial de mantenimientos
function MaintenanceHistory({ vehicleId }: { vehicleId: string }) {
  const { data: maintenances, isLoading } = useVehicleMaintenances(vehicleId);
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }
  
  if (!maintenances || maintenances.length === 0) {
    return (
      <div className="text-center py-8">
        <Wrench className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-muted-foreground">Sin mantenimientos registrados</p>
        <Link to="/admin/mantenimientos">
          <Button variant="outline" size="sm" className="mt-3">
            Programar mantenimiento
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {maintenances.map((maintenance: any) => (
        <div
          key={maintenance.id}
          className="flex items-center gap-4 p-3 rounded-lg border"
        >
          <div className={cn(
            'h-10 w-10 rounded-full flex items-center justify-center shrink-0',
            maintenance.status === 'completed' 
              ? 'bg-secondary/10' 
              : maintenance.status === 'in_progress'
              ? 'bg-orange-500/10'
              : 'bg-muted'
          )}>
            <Wrench className={cn(
              'h-5 w-5',
              maintenance.status === 'completed' 
                ? 'text-secondary' 
                : maintenance.status === 'in_progress'
                ? 'text-orange-500'
                : 'text-muted-foreground'
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium">
              {MAINTENANCE_TYPE_LABELS[maintenance.maintenance_type] || maintenance.maintenance_type}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(parseISO(maintenance.scheduled_date), 'dd MMM yyyy', { locale: es })}
              {maintenance.mileage_at_service && ` • ${maintenance.mileage_at_service.toLocaleString()} km`}
            </p>
          </div>
          <div className="text-right shrink-0">
            {maintenance.cost && (
              <p className="font-medium">{formatPrice(maintenance.cost)}</p>
            )}
            <Badge variant={
              maintenance.status === 'completed' ? 'default' :
              maintenance.status === 'in_progress' ? 'secondary' : 'outline'
            } className={maintenance.status === 'completed' ? 'bg-secondary' : ''}>
              {maintenance.status === 'completed' ? 'Completado' :
               maintenance.status === 'in_progress' ? 'En curso' : 'Pendiente'}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

// Página principal de detalle
export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: vehicle, isLoading, error } = useVehicle(id!);
  
  const deleteMutation = useDeleteVehicle();
  const updateMutation = useUpdateVehicle();
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const handleDelete = async () => {
    await deleteMutation.mutateAsync(id!);
    navigate('/admin/flota/vehiculos');
  };
  
  const handleStatusChange = async (newStatus: string) => {
    await updateMutation.mutateAsync({
      id: id!,
      updates: { status: newStatus as any },
    });
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }
  
  if (error || !vehicle) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Vehículo no encontrado</h2>
        <p className="text-muted-foreground mb-4">
          No pudimos encontrar el vehículo que buscas
        </p>
        <Button onClick={() => navigate('/admin/flota/vehiculos')}>
          Volver a la flota
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/flota/vehiculos')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                {vehicle.brand} {vehicle.model}
              </h1>
              <Badge className={cn(VEHICLE_STATUS_COLORS[vehicle.status])}>
                {VEHICLE_STATUS_LABELS[vehicle.status]}
              </Badge>
              {!vehicle.is_active && (
                <Badge variant="destructive">Inactivo</Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {vehicle.plate} • {vehicle.year}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Quick status change */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Cambiar estado
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(VEHICLE_STATUS_LABELS).map(([value, label]) => (
                <DropdownMenuItem
                  key={value}
                  onClick={() => handleStatusChange(value)}
                  disabled={vehicle.status === value}
                >
                  <div className={cn(
                    'h-2 w-2 rounded-full mr-2',
                    VEHICLE_STATUS_COLORS[value]?.replace('bg-', 'bg-').split(' ')[0]
                  )} />
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Link to={`/admin/flota/vehiculos/${vehicle.id}/editar`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/admin/mantenimientos?vehicle=${vehicle.id}`}>
                  <Wrench className="h-4 w-4 mr-2" />
                  Ver mantenimientos
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/admin/reservas?vehicle=${vehicle.id}`}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver reservas
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Desactivar vehículo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image and basic info */}
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Image */}
                <div className="relative h-64 md:h-auto bg-muted">
                  {vehicle.image_url ? (
                    <img
                      src={vehicle.image_url}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
                      <Car className="h-20 w-20 text-primary/20" />
                    </div>
                  )}
                </div>
                
                {/* Quick info */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem 
                      label="Matrícula" 
                      value={<span className="font-mono">{vehicle.plate}</span>}
                    />
                    <InfoItem label="Año" value={vehicle.year} />
                    <InfoItem 
                      label="Combustible" 
                      value={FUEL_TYPE_LABELS[vehicle.fuel_type]}
                      icon={Fuel}
                    />
                    <InfoItem 
                      label="Transmisión" 
                      value={TRANSMISSION_LABELS[vehicle.transmission]}
                      icon={Settings2}
                    />
                    <InfoItem 
                      label="Plazas" 
                      value={vehicle.seats}
                      icon={User}
                    />
                    <InfoItem 
                      label="Puertas" 
                      value={vehicle.doors || 4}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Tabs */}
          <Tabs defaultValue="features" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="features">Características</TabsTrigger>
              <TabsTrigger value="bookings">Reservas</TabsTrigger>
              <TabsTrigger value="maintenance">Mantenimientos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="features" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Equipamiento</CardTitle>
                </CardHeader>
                <CardContent>
                  <FeaturesList features={(vehicle.features as string[]) || []} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="bookings" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Historial de reservas</CardTitle>
                  <CardDescription>Últimas 10 reservas de este vehículo</CardDescription>
                </CardHeader>
                <CardContent>
                  <BookingHistory vehicleId={vehicle.id} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="maintenance" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Mantenimientos</CardTitle>
                      <CardDescription>Historial de mantenimientos del vehículo</CardDescription>
                    </div>
                    <Link to={`/admin/mantenimientos/nuevo?vehicle=${vehicle.id}`}>
                      <Button size="sm">
                        Programar
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <MaintenanceHistory vehicleId={vehicle.id} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Notes */}
          {vehicle.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Notas internas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{vehicle.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Group and location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Asignación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Grupo</p>
                <Link 
                  to={`/admin/flota/grupos`}
                  className="flex items-center gap-2 font-medium hover:text-primary transition-colors"
                >
                  <Car className="h-4 w-4" />
                  {vehicle.vehicle_group?.name || 'Sin grupo'}
                  {vehicle.vehicle_group?.code && (
                    <Badge variant="outline">{vehicle.vehicle_group.code}</Badge>
                  )}
                </Link>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Ubicación actual</p>
                <div className="flex items-center gap-2 font-medium">
                  <MapPin className="h-4 w-4 text-primary" />
                  {vehicle.current_location?.name || 'Sin ubicación'}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Technical details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalles técnicos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Kilometraje</span>
                <span className="font-medium">{vehicle.current_mileage?.toLocaleString()} km</span>
              </div>
              
              {vehicle.vin && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">VIN</span>
                  <span className="font-mono text-xs">{vehicle.vin}</span>
                </div>
              )}
              
              {vehicle.color && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Color</span>
                  <span className="font-medium">{vehicle.color}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Propiedad</span>
                <span className="font-medium">
                  {OWNERSHIP_TYPE_LABELS[vehicle.ownership_type] || vehicle.ownership_type}
                </span>
              </div>
            </CardContent>
          </Card>
          
          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fechas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Registrado</span>
                <span>{format(parseISO(vehicle.created_at), 'dd/MM/yyyy')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Última actualización</span>
                <span>{format(parseISO(vehicle.updated_at), 'dd/MM/yyyy HH:mm')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Delete Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Desactivar vehículo"
        description={`¿Estás seguro de que quieres desactivar el vehículo ${vehicle.plate}? El vehículo no se eliminará pero dejará de estar disponible para reservas.`}
        confirmText="Desactivar"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
