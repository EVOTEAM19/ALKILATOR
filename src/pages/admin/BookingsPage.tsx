import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  Car,
  Phone,
  CheckCircle2,
  AlertCircle,
  ArrowUpDown,
  RefreshCw,
  CalendarDays,
  Truck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useBookings, useBookingStats, useTodayBookings, useCancelBooking } from '@/hooks/useBookings';
import { useLocations } from '@/hooks/useLocations';
import { useVehicleGroups } from '@/hooks/useVehicleGroups';
import { 
  BOOKING_STATUS_LABELS, 
  BOOKING_STATUS_COLORS,
} from '@/lib/constants';
import type { BookingFilters, Booking } from '@/types';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

// Componente de tarjeta de estadística pequeña
function StatBadge({ 
  label, 
  value, 
  color 
}: { 
  label: string; 
  value: number; 
  color: string;
}) {
  return (
    <div className={cn('px-4 py-2 rounded-lg text-center', color)}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-80">{label}</p>
    </div>
  );
}

// Componente de reserva de hoy (recogida/devolución)
function TodayBookingCard({ 
  booking, 
  type 
}: { 
  booking: Booking; 
  type: 'pickup' | 'return';
}) {
  const time = type === 'pickup' ? booking.pickup_time : booking.return_time;
  const location = type === 'pickup' ? booking.pickup_location : booking.return_location;
  
  return (
    <Link
      to={`/admin/reservas/${booking.id}`}
      className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
    >
      <div className={cn(
        'h-10 w-10 rounded-full flex items-center justify-center shrink-0',
        type === 'pickup' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
      )}>
        {type === 'pickup' ? <Truck className="h-5 w-5" /> : <Car className="h-5 w-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">
            {booking.customer?.first_name} {booking.customer?.last_name}
          </span>
          <Badge variant="outline" className="shrink-0 text-xs">
            {time}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{booking.vehicle_group?.name}</span>
          <span>•</span>
          <span className="truncate">{location?.name}</span>
        </div>
      </div>
      {booking.customer?.phone && (
        <a 
          href={`tel:${booking.customer.phone}`}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
        >
          <Phone className="h-4 w-4" />
        </a>
      )}
    </Link>
  );
}

// Componente de filtros
function BookingFiltersPanel({
  filters,
  onFiltersChange,
  onClear,
}: {
  filters: BookingFilters;
  onFiltersChange: (filters: BookingFilters) => void;
  onClear: () => void;
}) {
  const { data: locations } = useLocations();
  const { vehicleGroups } = useVehicleGroups();
  
  const hasActiveFilters = Object.values(filters).some(v => 
    v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)
  );
  
  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estado */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Estado</label>
          <Select
            value={filters.status || 'all'}
            onValueChange={(v) => onFiltersChange({ 
              ...filters, 
              status: v === 'all' ? undefined : v as any
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {Object.entries(BOOKING_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Ubicación */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Ubicación</label>
          <Select
            value={filters.location_id || 'all'}
            onValueChange={(v) => onFiltersChange({ 
              ...filters, 
              location_id: v === 'all' ? undefined : v
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas las ubicaciones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las ubicaciones</SelectItem>
              {locations?.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Grupo de vehículo */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Categoría</label>
          <Select
            value="all"
            onValueChange={() => {}}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {vehicleGroups?.map((group) => (
                <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Origen */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Origen</label>
          <Select
            value={filters.source || 'all'}
            onValueChange={(v) => onFiltersChange({ 
              ...filters, 
              source: v === 'all' ? undefined : v as any
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="web">Web</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="phone">Teléfono</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Rango de fechas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Desde</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <CalendarDays className="h-4 w-4 mr-2" />
                {filters.pickup_date_from 
                  ? format(parseISO(filters.pickup_date_from), 'dd/MM/yyyy')
                  : 'Seleccionar fecha'
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={filters.pickup_date_from ? parseISO(filters.pickup_date_from) : undefined}
                onSelect={(date) => onFiltersChange({
                  ...filters,
                  pickup_date_from: date ? format(date, 'yyyy-MM-dd') : undefined
                })}
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Hasta</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <CalendarDays className="h-4 w-4 mr-2" />
                {filters.pickup_date_to 
                  ? format(parseISO(filters.pickup_date_to), 'dd/MM/yyyy')
                  : 'Seleccionar fecha'
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={filters.pickup_date_to ? parseISO(filters.pickup_date_to) : undefined}
                onSelect={(date) => onFiltersChange({
                  ...filters,
                  pickup_date_to: date ? format(date, 'yyyy-MM-dd') : undefined
                })}
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}

// Fila de la tabla de reservas
function BookingRow({ booking }: { booking: Booking }) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const cancelMutation = useCancelBooking();
  
  const pickupDate = parseISO(booking.pickup_date);
  const isPickupToday = isToday(pickupDate);
  const isPickupTomorrow = isTomorrow(pickupDate);
  const isPickupPast = isPast(pickupDate) && !isPickupToday;
  
  const handleCancel = async () => {
    await cancelMutation.mutateAsync({ 
      bookingId: booking.id, 
      reason: cancelReason || 'Cancelación manual' 
    });
    setShowCancelDialog(false);
    setCancelReason('');
  };
  
  return (
    <>
      <TableRow className="hover:bg-muted/50">
        <TableCell>
          <div className="flex flex-col">
            <Link 
              to={`/admin/reservas/${booking.id}`}
              className="font-mono font-medium text-primary hover:underline"
            >
              {booking.booking_number}
            </Link>
            <span className="text-xs text-muted-foreground">
              {format(parseISO(booking.created_at), 'dd/MM/yy HH:mm')}
            </span>
          </div>
        </TableCell>
        
        <TableCell>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">
                {booking.customer?.first_name} {booking.customer?.last_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {booking.customer?.email}
              </p>
            </div>
          </div>
        </TableCell>
        
        <TableCell>
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-muted-foreground" />
            <span>{booking.vehicle_group?.name}</span>
          </div>
          {booking.vehicle && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {booking.vehicle.brand} {booking.vehicle.model} • {booking.vehicle.plate}
            </p>
          )}
        </TableCell>
        
        <TableCell>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className={cn(
                'h-2 w-2 rounded-full shrink-0',
                isPickupToday ? 'bg-secondary' : isPickupTomorrow ? 'bg-orange-500' : 'bg-muted-foreground'
              )} />
              <span className={cn(
                'text-sm',
                isPickupToday && 'font-medium text-secondary',
                isPickupTomorrow && 'font-medium text-orange-500'
              )}>
                {format(pickupDate, 'dd MMM', { locale: es })}
              </span>
              <span className="text-xs text-muted-foreground">{booking.pickup_time}</span>
            </div>
            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
              {booking.pickup_location?.name}
            </p>
          </div>
        </TableCell>
        
        <TableCell>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {format(parseISO(booking.return_date), 'dd MMM', { locale: es })}
              </span>
              <span className="text-xs text-muted-foreground">{booking.return_time}</span>
            </div>
            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
              {booking.return_location?.name}
            </p>
          </div>
        </TableCell>
        
        <TableCell>
          <div className="text-right">
            <p className="font-medium">{formatPrice(booking.total_price)}</p>
            <Badge 
              variant={booking.is_paid ? 'default' : 'outline'} 
              className={cn('text-xs', booking.is_paid && 'bg-secondary')}
            >
              {booking.is_paid ? 'Pagado' : 'Pendiente'}
            </Badge>
          </div>
        </TableCell>
        
        <TableCell>
          <Badge className={cn(BOOKING_STATUS_COLORS[booking.status])}>
            {BOOKING_STATUS_LABELS[booking.status]}
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
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`/admin/reservas/${booking.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver detalle
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/admin/reservas/${booking.id}/editar`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Link>
              </DropdownMenuItem>
              {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setShowCancelDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
      
      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Cancelar reserva"
        description={`¿Estás seguro de que quieres cancelar la reserva ${booking.booking_number}? Esta acción no se puede deshacer.`}
        confirmText="Cancelar reserva"
        variant="destructive"
        isLoading={cancelMutation.isPending}
        onConfirm={handleCancel}
      />
    </>
  );
}

// Página principal de reservas
export default function BookingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  
  // Filtros desde URL
  const filters: BookingFilters = useMemo(() => ({
    status: searchParams.get('status') as any || undefined,
    location_id: searchParams.get('location') || undefined,
    pickup_date_from: searchParams.get('from') || undefined,
    pickup_date_to: searchParams.get('to') || undefined,
    source: searchParams.get('source') as any || undefined,
    search: searchParams.get('search') || undefined,
  }), [searchParams]);
  
  const page = parseInt(searchParams.get('page') || '1');
  
  // Queries
  const { data: bookingsData, isLoading, refetch } = useBookings(filters, page, 20);
  const { data: stats } = useBookingStats();
  const { data: todayData } = useTodayBookings();
  
  // Actualizar filtros
  const updateFilters = (newFilters: BookingFilters) => {
    const params = new URLSearchParams();
    
    if (newFilters.status) params.set('status', newFilters.status);
    if (newFilters.location_id) params.set('location', newFilters.location_id);
    if (newFilters.pickup_date_from) params.set('from', newFilters.pickup_date_from);
    if (newFilters.pickup_date_to) params.set('to', newFilters.pickup_date_to);
    if (newFilters.source) params.set('source', newFilters.source);
    if (newFilters.search) params.set('search', newFilters.search);
    
    params.set('page', '1'); // Reset a página 1
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
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reservas</h1>
          <p className="text-muted-foreground">
            Gestiona todas las reservas de tu empresa
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Link to="/admin/reservas/nueva">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Nueva reserva
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex flex-wrap gap-3">
        <StatBadge 
          label="Pendientes" 
          value={stats?.pending || 0} 
          color="bg-yellow-500/10 text-yellow-600"
        />
        <StatBadge 
          label="Confirmadas" 
          value={stats?.confirmed || 0} 
          color="bg-blue-500/10 text-blue-600"
        />
        <StatBadge 
          label="En curso" 
          value={stats?.inProgress || 0} 
          color="bg-secondary/10 text-secondary"
        />
        <StatBadge 
          label="Finalizadas hoy" 
          value={stats?.completedToday || 0} 
          color="bg-muted text-muted-foreground"
        />
      </div>
      
      {/* Today's Activity */}
      {(todayData?.pickups?.length > 0 || todayData?.returns?.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recogidas de hoy */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Recogidas hoy
                <Badge variant="secondary" className="ml-auto">
                  {todayData?.pickups?.length || 0}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {todayData?.pickups?.length ? (
                todayData.pickups.map((booking) => (
                  <TodayBookingCard key={booking.id} booking={booking} type="pickup" />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay recogidas programadas
                </p>
              )}
            </CardContent>
          </Card>
          
          {/* Devoluciones de hoy */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Car className="h-5 w-5 text-secondary" />
                Devoluciones hoy
                <Badge variant="secondary" className="ml-auto">
                  {todayData?.returns?.length || 0}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {todayData?.returns?.length ? (
                todayData.returns.map((booking) => (
                  <TodayBookingCard key={booking.id} booking={booking} type="return" />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay devoluciones programadas
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número, cliente, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleSearch}>Buscar</Button>
            </div>
            
            {/* Filter toggle */}
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-muted' : ''}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {Object.values(filters).filter(v => v !== undefined && v !== '').length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {Object.values(filters).filter(v => v !== undefined && v !== '').length}
                </Badge>
              )}
            </Button>
          </div>
          
          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4">
              <BookingFiltersPanel
                filters={filters}
                onFiltersChange={updateFilters}
                onClear={clearFilters}
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Bookings Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-20" />
                </div>
              ))}
            </div>
          ) : bookingsData?.data.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay reservas</h3>
              <p className="text-muted-foreground mb-4">
                {Object.values(filters).some(v => v !== undefined) 
                  ? 'No se encontraron reservas con los filtros aplicados'
                  : 'Aún no tienes reservas registradas'
                }
              </p>
              {Object.values(filters).some(v => v !== undefined) && (
                <Button variant="outline" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[130px]">Reserva</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Vehículo</TableHead>
                    <TableHead>Recogida</TableHead>
                    <TableHead>Devolución</TableHead>
                    <TableHead className="text-right">Importe</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookingsData?.data.map((booking) => (
                    <BookingRow key={booking.id} booking={booking} />
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {bookingsData && bookingsData.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {((page - 1) * 20) + 1} - {Math.min(page * 20, bookingsData.count)} de {bookingsData.count} reservas
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
                      Página {page} de {bookingsData.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= bookingsData.totalPages}
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
    </div>
  );
}
