import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Car,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Fuel,
  Settings2,
  MapPin,
  Gauge,
  CheckCircle2,
  XCircle,
  Wrench,
  Calendar,
  X,
  Grid3X3,
  List
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
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
  DropdownMenuLabel,
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVehicles, useFleetStats, useDeleteVehicle } from '@/hooks/useVehicles';
import { useVehicleGroupsAdmin } from '@/hooks/useVehicleGroups';
import { useLocations } from '@/hooks/useLocations';
import { 
  VEHICLE_STATUS_LABELS, 
  VEHICLE_STATUS_COLORS,
  FUEL_TYPE_LABELS,
  TRANSMISSION_LABELS
} from '@/lib/constants';
import type { VehicleFilters, Vehicle } from '@/types';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

// Componente de tarjeta de estadística
function FleetStatCard({ 
  label, 
  value, 
  icon: Icon, 
  color,
  percentage,
}: { 
  label: string; 
  value: number; 
  icon: any;
  color: string;
  percentage?: number;
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
      <div className={cn('h-12 w-12 rounded-lg flex items-center justify-center', color)}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      {percentage !== undefined && (
        <div className="text-right">
          <p className="text-lg font-semibold">{percentage}%</p>
          <p className="text-xs text-muted-foreground">del total</p>
        </div>
      )}
    </div>
  );
}

// Componente de tarjeta de vehículo (vista grid)
function VehicleCard({ vehicle, onDelete }: { vehicle: Vehicle; onDelete: () => void }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative h-40 bg-muted">
        {vehicle.image_url ? (
          <img
            src={vehicle.image_url}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
            <Car className="h-16 w-16 text-primary/20" />
          </div>
        )}
        
        {/* Status badge */}
        <Badge 
          className={cn('absolute top-2 right-2', VEHICLE_STATUS_COLORS[vehicle.status])}
        >
          {VEHICLE_STATUS_LABELS[vehicle.status]}
        </Badge>
        
        {/* Group badge */}
        <Badge variant="secondary" className="absolute top-2 left-2">
          {vehicle.vehicle_group?.name || 'Sin grupo'}
        </Badge>
      </div>
      
      {/* Content */}
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold">{vehicle.brand} {vehicle.model}</h3>
            <p className="text-sm text-muted-foreground">{vehicle.year}</p>
          </div>
          <span className="font-mono text-sm font-medium bg-muted px-2 py-1 rounded">
            {vehicle.plate}
          </span>
        </div>
        
        {/* Features */}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Fuel className="h-3 w-3" />
            {FUEL_TYPE_LABELS[vehicle.fuel_type]}
          </span>
          <span className="flex items-center gap-1">
            <Settings2 className="h-3 w-3" />
            {TRANSMISSION_LABELS[vehicle.transmission]}
          </span>
          <span className="flex items-center gap-1">
            <Gauge className="h-3 w-3" />
            {vehicle.current_mileage?.toLocaleString()} km
          </span>
        </div>
        
        {/* Location */}
        {vehicle.current_location && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
            <MapPin className="h-3 w-3" />
            {vehicle.current_location.name}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-2">
          <Link to={`/admin/flota/vehiculos/${vehicle.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="h-4 w-4 mr-1" />
              Ver
            </Button>
          </Link>
          <Link to={`/admin/flota/vehiculos/${vehicle.id}/editar`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/admin/flota/vehiculos/${vehicle.id}`}>
                  Ver detalle
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/admin/flota/vehiculos/${vehicle.id}/editar`}>
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Desactivar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

// Fila de la tabla de vehículos
function VehicleRow({ vehicle, onDelete }: { vehicle: Vehicle; onDelete: () => void }) {
  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-10 w-14 rounded bg-muted overflow-hidden shrink-0">
            {vehicle.image_url ? (
              <img
                src={vehicle.image_url}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Car className="h-5 w-5 text-muted-foreground/50" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
            <p className="text-xs text-muted-foreground">{vehicle.year}</p>
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <span className="font-mono font-medium">{vehicle.plate}</span>
      </TableCell>
      
      <TableCell>
        <Badge variant="outline">{vehicle.vehicle_group?.name || '-'}</Badge>
      </TableCell>
      
      <TableCell>
        <div className="flex flex-col gap-1 text-sm">
          <span className="flex items-center gap-1">
            <Fuel className="h-3 w-3 text-muted-foreground" />
            {FUEL_TYPE_LABELS[vehicle.fuel_type]}
          </span>
          <span className="flex items-center gap-1">
            <Settings2 className="h-3 w-3 text-muted-foreground" />
            {TRANSMISSION_LABELS[vehicle.transmission]}
          </span>
        </div>
      </TableCell>
      
      <TableCell>
        <span className="text-sm">{vehicle.current_mileage?.toLocaleString()} km</span>
      </TableCell>
      
      <TableCell>
        <span className="text-sm truncate max-w-[120px] block">
          {vehicle.current_location?.name || '-'}
        </span>
      </TableCell>
      
      <TableCell>
        <Badge className={cn(VEHICLE_STATUS_COLORS[vehicle.status])}>
          {VEHICLE_STATUS_LABELS[vehicle.status]}
        </Badge>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-1">
          <Link to={`/admin/flota/vehiculos/${vehicle.id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Link to={`/admin/flota/vehiculos/${vehicle.id}/editar`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Desactivar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}

// Página principal de vehículos
export default function VehiclesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  
  // Filtros desde URL
  const filters: VehicleFilters = useMemo(() => ({
    status: searchParams.get('status') as any || undefined,
    vehicle_group_id: searchParams.get('group') || undefined,
    location_id: searchParams.get('location') || undefined,
    fuel_type: searchParams.get('fuel') as any || undefined,
    search: searchParams.get('search') || undefined,
  }), [searchParams]);
  
  const page = parseInt(searchParams.get('page') || '1');
  
  // Queries
  const { data: vehiclesData, isLoading, refetch } = useVehicles(filters, page, viewMode === 'grid' ? 12 : 20);
  const { data: stats } = useFleetStats();
  const { data: groups } = useVehicleGroupsAdmin();
  const { data: locations } = useLocations();
  
  const deleteMutation = useDeleteVehicle();
  
  // Actualizar filtros
  const updateFilters = (newFilters: VehicleFilters) => {
    const params = new URLSearchParams();
    
    if (newFilters.status) params.set('status', newFilters.status);
    if (newFilters.vehicle_group_id) params.set('group', newFilters.vehicle_group_id);
    if (newFilters.location_id) params.set('location', newFilters.location_id);
    if (newFilters.fuel_type) params.set('fuel', newFilters.fuel_type);
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
  
  const handleDelete = async () => {
    if (vehicleToDelete) {
      await deleteMutation.mutateAsync(vehicleToDelete.id);
      setVehicleToDelete(null);
    }
  };
  
  const occupancyRate = stats ? Math.round((stats.rented / stats.total) * 100) || 0;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Flota de vehículos</h1>
          <p className="text-muted-foreground">
            Gestiona todos los vehículos de tu empresa
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Link to="/admin/flota/vehiculos/nuevo">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo vehículo
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <FleetStatCard
          label="Total vehículos"
          value={stats?.total || 0}
          icon={Car}
          color="bg-primary"
        />
        <FleetStatCard
          label="Disponibles"
          value={stats?.available || 0}
          icon={CheckCircle2}
          color="bg-secondary"
          percentage={stats?.total ? Math.round((stats.available / stats.total) * 100) : 0}
        />
        <FleetStatCard
          label="Alquilados"
          value={stats?.rented || 0}
          icon={Calendar}
          color="bg-orange-500"
          percentage={occupancyRate}
        />
        <FleetStatCard
          label="En mantenimiento"
          value={stats?.maintenance || 0}
          icon={Wrench}
          color="bg-yellow-500"
        />
        <FleetStatCard
          label="Inactivos"
          value={stats?.inactive || 0}
          icon={XCircle}
          color="bg-muted-foreground"
        />
      </div>
      
      {/* Occupancy */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Tasa de ocupación</span>
            <span className="text-sm font-bold">{occupancyRate}%</span>
          </div>
          <Progress value={occupancyRate} className="h-2" />
        </CardContent>
      </Card>
      
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por matrícula, marca, modelo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleSearch}>Buscar</Button>
            </div>
            
            {/* Quick filters */}
            <div className="flex flex-wrap gap-2">
              <Select
                value={filters.status || 'all'}
                onValueChange={(v) => updateFilters({ ...filters, status: v === 'all' ? undefined : v as any })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(VEHICLE_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={filters.vehicle_group_id || 'all'}
                onValueChange={(v) => updateFilters({ ...filters, vehicle_group_id: v === 'all' ? undefined : v })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {groups?.map((group) => (
                    <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={filters.location_id || 'all'}
                onValueChange={(v) => updateFilters({ ...filters, location_id: v === 'all' ? undefined : v })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Ubicación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {locations?.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {Object.values(filters).some(v => v !== undefined) && (
                <Button variant="ghost" size="icon" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                </Button>
              )}
              
              {/* View toggle */}
              <div className="border-l pl-2 ml-2">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
                  <TabsList className="h-9">
                    <TabsTrigger value="list" className="px-2">
                      <List className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="grid" className="px-2">
                      <Grid3X3 className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Vehicles List/Grid */}
      {isLoading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-40" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-14" />
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-20" />
                </div>
              ))}
            </CardContent>
          </Card>
        )
      ) : vehiclesData?.data.length === 0 ? (
        <Card className="p-12 text-center">
          <Car className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No hay vehículos</h3>
          <p className="text-muted-foreground mb-4">
            {Object.values(filters).some(v => v !== undefined)
              ? 'No se encontraron vehículos con los filtros aplicados'
              : 'Aún no tienes vehículos registrados'
            }
          </p>
          <div className="flex justify-center gap-3">
            {Object.values(filters).some(v => v !== undefined) && (
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )}
            <Link to="/admin/flota/vehiculos/nuevo">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Añadir vehículo
              </Button>
            </Link>
          </div>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {vehiclesData?.data.map((vehicle) => (
            <VehicleCard 
              key={vehicle.id} 
              vehicle={vehicle} 
              onDelete={() => setVehicleToDelete(vehicle)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehículo</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead>Características</TableHead>
                <TableHead>Kilometraje</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehiclesData?.data.map((vehicle) => (
                <VehicleRow 
                  key={vehicle.id} 
                  vehicle={vehicle}
                  onDelete={() => setVehicleToDelete(vehicle)}
                />
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      
      {/* Pagination */}
      {vehiclesData && vehiclesData.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {((page - 1) * (viewMode === 'grid' ? 12 : 20)) + 1} - {Math.min(page * (viewMode === 'grid' ? 12 : 20), vehiclesData.count)} de {vehiclesData.count} vehículos
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
              Página {page} de {vehiclesData.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= vehiclesData.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Delete Dialog */}
      <ConfirmDialog
        open={!!vehicleToDelete}
        onOpenChange={(open) => !open && setVehicleToDelete(null)}
        title="Desactivar vehículo"
        description={`¿Estás seguro de que quieres desactivar el vehículo ${vehicleToDelete?.plate}? El vehículo no se eliminará, pero dejará de estar disponible.`}
        confirmText="Desactivar"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
