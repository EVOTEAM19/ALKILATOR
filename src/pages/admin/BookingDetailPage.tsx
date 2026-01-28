import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  Calendar,
  Car,
  User,
  MapPin,
  Clock,
  CreditCard,
  FileText,
  Phone,
  Mail,
  Edit,
  Printer,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  Truck,
  Play,
  Square,
  X,
  Camera,
  Fuel,
  Gauge,
  MessageSquare,
  History,
  Download,
  FileSignature
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  useBooking, 
  useUpdateBookingStatus, 
  useStartRental, 
  useCompleteRental,
  useCancelBooking 
} from '@/hooks/useBookings';
import { 
  BOOKING_STATUS_LABELS, 
  BOOKING_STATUS_COLORS,
  FUEL_LEVELS,
  FUEL_LEVEL_LABELS
} from '@/lib/constants';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { ContractPreviewDialog } from '@/components/admin/ContractPreviewDialog';
import { ContractSignDialog } from '@/components/admin/ContractSignDialog';

// Componente de información del cliente
function CustomerInfo({ customer }: { customer: any }) {
  if (!customer) return null;
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Cliente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-medium text-primary">
              {customer.first_name?.charAt(0)}{customer.last_name?.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium">{customer.first_name} {customer.last_name}</p>
            <p className="text-sm text-muted-foreground">
              {customer.document_type?.toUpperCase()}: {customer.document_number}
            </p>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <a 
            href={`mailto:${customer.email}`}
            className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
          >
            <Mail className="h-4 w-4 text-muted-foreground" />
            {customer.email}
          </a>
          {customer.phone && (
            <a 
              href={`tel:${customer.phone}`}
              className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
            >
              <Phone className="h-4 w-4 text-muted-foreground" />
              {customer.phone}
            </a>
          )}
        </div>
        
        <Link to={`/admin/clientes/${customer.id}`}>
          <Button variant="outline" size="sm" className="w-full mt-2">
            Ver perfil completo
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// Diálogo para iniciar alquiler
function StartRentalDialog({
  open,
  onOpenChange,
  booking,
  onConfirm,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: any;
  onConfirm: (data: any) => void;
  isLoading: boolean;
}) {
  const [mileage, setMileage] = useState('');
  const [fuelLevel, setFuelLevel] = useState('full');
  const [notes, setNotes] = useState('');
  
  const handleConfirm = () => {
    const fuelLevelIndex = FUEL_LEVELS.findIndex(level => level === fuelLevel);
    onConfirm({
      vehicleId: booking.vehicle_id || booking.vehicle?.id,
      pickupMileage: parseInt(mileage) || 0,
      pickupFuelLevel: fuelLevelIndex >= 0 ? fuelLevelIndex : 4, // default to 'full'
      pickupNotes: notes || undefined,
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-secondary" />
            Iniciar alquiler
          </DialogTitle>
          <DialogDescription>
            Registra los datos del vehículo al momento de la entrega
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="mileage">Kilometraje actual *</Label>
            <div className="relative">
              <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="mileage"
                type="number"
                placeholder="Ej: 45000"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fuel">Nivel de combustible *</Label>
            <Select value={fuelLevel} onValueChange={setFuelLevel}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Fuel className="h-4 w-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {FUEL_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {FUEL_LEVEL_LABELS[level]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Observaciones sobre el estado del vehículo..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!mileage || isLoading}
            className="bg-secondary hover:bg-secondary/90"
          >
            {isLoading ? 'Procesando...' : 'Confirmar entrega'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Diálogo para finalizar alquiler
function CompleteRentalDialog({
  open,
  onOpenChange,
  booking,
  onConfirm,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: any;
  onConfirm: (data: any) => void;
  isLoading: boolean;
}) {
  const [mileage, setMileage] = useState('');
  const [fuelLevel, setFuelLevel] = useState('full');
  const [notes, setNotes] = useState('');
  const [damages, setDamages] = useState('0');
  const [fuelCharge, setFuelCharge] = useState('0');
  const [cleaning, setCleaning] = useState('0');
  
  // Calcular km incluidos (150 km/día por defecto)
  const totalDays = booking ? differenceInDays(parseISO(booking.return_date), parseISO(booking.pickup_date)) || 1 : 1;
  const kmIncluded = totalDays * 150; // 150 km/día por defecto
  
  const extraKm = booking?.pickup_mileage && mileage 
    ? Math.max(0, parseInt(mileage) - booking.pickup_mileage - kmIncluded)
    : 0;
  const extraKmCharge = extraKm * 0.15; // 0.15€/km extra
  
  const handleConfirm = () => {
    const fuelLevelIndex = FUEL_LEVELS.findIndex(level => level === fuelLevel);
    onConfirm({
      returnMileage: parseInt(mileage) || 0,
      returnFuelLevel: fuelLevelIndex >= 0 ? fuelLevelIndex : 4, // default to 'full'
      returnNotes: notes || undefined,
      additionalCharges: {
        damages: parseFloat(damages) || 0,
        fuel: parseFloat(fuelCharge) || 0,
        cleaning: parseFloat(cleaning) || 0,
        extraKm: extraKmCharge,
      },
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Square className="h-5 w-5 text-primary" />
            Finalizar alquiler
          </DialogTitle>
          <DialogDescription>
            Registra los datos del vehículo al momento de la devolución
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          {/* Datos del vehículo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="return-mileage">Kilometraje actual *</Label>
              <div className="relative">
                <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="return-mileage"
                  type="number"
                  placeholder="Ej: 45500"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  className="pl-9"
                />
              </div>
              {booking?.pickup_mileage && (
                <p className="text-xs text-muted-foreground">
                  Km entrega: {booking.pickup_mileage.toLocaleString()}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="return-fuel">Nivel de combustible *</Label>
              <Select value={fuelLevel} onValueChange={setFuelLevel}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {FUEL_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {FUEL_LEVEL_LABELS[level]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Separator />
          
          {/* Cargos adicionales */}
          <div>
            <h4 className="font-medium mb-3">Cargos adicionales</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="damages">Daños (€)</Label>
                <Input
                  id="damages"
                  type="number"
                  step="0.01"
                  value={damages}
                  onChange={(e) => setDamages(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fuel-charge">Repostaje (€)</Label>
                <Input
                  id="fuel-charge"
                  type="number"
                  step="0.01"
                  value={fuelCharge}
                  onChange={(e) => setFuelCharge(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cleaning">Limpieza (€)</Label>
                <Input
                  id="cleaning"
                  type="number"
                  step="0.01"
                  value={cleaning}
                  onChange={(e) => setCleaning(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Km extra ({extraKm} km)</Label>
                <Input
                  type="text"
                  value={formatPrice(extraKmCharge)}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="return-notes">Notas (opcional)</Label>
            <Textarea
              id="return-notes"
              placeholder="Observaciones sobre el estado del vehículo..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          
          {/* Resumen de cargos */}
          {(parseFloat(damages) > 0 || parseFloat(fuelCharge) > 0 || parseFloat(cleaning) > 0 || extraKmCharge > 0) && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm font-medium mb-2">Total cargos adicionales:</p>
              <p className="text-xl font-bold text-primary">
                {formatPrice(
                  parseFloat(damages || '0') + 
                  parseFloat(fuelCharge || '0') + 
                  parseFloat(cleaning || '0') + 
                  extraKmCharge
                )}
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!mileage || isLoading}
          >
            {isLoading ? 'Procesando...' : 'Finalizar alquiler'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Página principal de detalle
export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: booking, isLoading, error, refetch } = useBooking(id!);
  
  const updateStatusMutation = useUpdateBookingStatus();
  const startRentalMutation = useStartRental();
  const completeRentalMutation = useCompleteRental();
  const cancelMutation = useCancelBooking();
  
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showContractPreview, setShowContractPreview] = useState(false);
  const [showContractSign, setShowContractSign] = useState(false);
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-48" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !booking) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Reserva no encontrada</h2>
        <p className="text-muted-foreground mb-4">
          No pudimos encontrar la reserva que buscas
        </p>
        <Button onClick={() => navigate('/admin/reservas')}>
          Volver a reservas
        </Button>
      </div>
    );
  }
  
  const totalDays = differenceInDays(
    parseISO(booking.return_date),
    parseISO(booking.pickup_date)
  ) || 1;
  
  // Determinar acciones disponibles según estado
  const canConfirm = booking.status === 'pending';
  const canStartRental = booking.status === 'confirmed';
  const canCompleteRental = booking.status === 'in_progress';
  const canCancel = ['pending', 'confirmed'].includes(booking.status);
  
  const handleConfirm = async () => {
    await updateStatusMutation.mutateAsync({
      bookingId: booking.id,
      status: 'confirmed',
    });
  };
  
  const handleStartRental = async (data: any) => {
    await startRentalMutation.mutateAsync({
      bookingId: booking.id,
      data,
    });
    setShowStartDialog(false);
  };
  
  const handleCompleteRental = async (data: any) => {
    await completeRentalMutation.mutateAsync({
      bookingId: booking.id,
      data,
    });
    setShowCompleteDialog(false);
  };
  
  const handleCancel = async () => {
    await cancelMutation.mutateAsync({
      bookingId: booking.id,
      reason: cancelReason || 'Cancelación manual',
    });
    setShowCancelDialog(false);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/reservas')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-mono">{booking.booking_number}</h1>
              <Badge className={cn(BOOKING_STATUS_COLORS[booking.status])}>
                {BOOKING_STATUS_LABELS[booking.status]}
              </Badge>
              {booking.is_paid && (
                <Badge variant="outline" className="text-secondary border-secondary">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Pagado
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Creada el {format(parseISO(booking.created_at), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Action buttons based on status */}
          {canConfirm && (
            <Button 
              onClick={handleConfirm}
              disabled={updateStatusMutation.isPending}
              className="bg-secondary hover:bg-secondary/90"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirmar
            </Button>
          )}
          
          {canStartRental && (
            <Button 
              onClick={() => setShowStartDialog(true)}
              className="bg-secondary hover:bg-secondary/90"
            >
              <Play className="h-4 w-4 mr-2" />
              Iniciar alquiler
            </Button>
          )}
          
          {canCompleteRental && (
            <Button onClick={() => setShowCompleteDialog(true)}>
              <Square className="h-4 w-4 mr-2" />
              Finalizar alquiler
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Más acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`/admin/reservas/${booking.id}/editar`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar reserva
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowContractPreview(true)}>
                <FileText className="h-4 w-4 mr-2" />
                Ver contrato
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowContractSign(true)}>
                <FileSignature className="h-4 w-4 mr-2" />
                Firmar contrato
              </DropdownMenuItem>
              {canCancel && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setShowCancelDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar reserva
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle & Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalles del alquiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Vehicle */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Car className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg">{booking.vehicle_group?.name}</p>
                  {booking.vehicle ? (
                    <p className="text-muted-foreground">
                      {booking.vehicle.brand} {booking.vehicle.model} • {booking.vehicle.plate}
                    </p>
                  ) : (
                    <p className="text-muted-foreground">Vehículo por asignar</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{totalDays} días</p>
                  <p className="font-semibold">{formatPrice(booking.base_price)}</p>
                </div>
              </div>
              
              {/* Dates & Locations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    Recogida
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {format(parseISO(booking.pickup_date), "EEEE, d 'de' MMMM", { locale: es })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{booking.pickup_time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{booking.pickup_location?.name}</span>
                  </div>
                </div>
                
                <div className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-secondary" />
                    Devolución
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {format(parseISO(booking.return_date), "EEEE, d 'de' MMMM", { locale: es })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{booking.return_time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{booking.return_location?.name}</span>
                  </div>
                </div>
              </div>
              
              {/* Pickup/Return data if exists */}
              {booking.status === 'in_progress' && booking.pickup_mileage && (
                <div className="p-4 bg-secondary/10 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-secondary" />
                    Datos de entrega
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Km</span>
                      <p className="font-medium">{booking.pickup_mileage.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Combustible</span>
                      <p className="font-medium">
                        {booking.pickup_fuel_level !== undefined && booking.pickup_fuel_level < FUEL_LEVELS.length
                          ? FUEL_LEVEL_LABELS[FUEL_LEVELS[booking.pickup_fuel_level]]
                          : '-'
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fecha real</span>
                      <p className="font-medium">
                        {booking.pickup_completed_at 
                          ? format(parseISO(booking.pickup_completed_at), 'dd/MM/yy HH:mm')
                          : '-'
                        }
                      </p>
                    </div>
                  </div>
                  {booking.pickup_notes && (
                    <p className="text-sm text-muted-foreground mt-2">
                      <strong>Notas:</strong> {booking.pickup_notes}
                    </p>
                  )}
                </div>
              )}
              
              {booking.status === 'completed' && booking.return_mileage && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Datos de devolución
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Km</span>
                      <p className="font-medium">{booking.return_mileage.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Combustible</span>
                      <p className="font-medium">
                        {booking.return_fuel_level !== undefined && booking.return_fuel_level < FUEL_LEVELS.length
                          ? FUEL_LEVEL_LABELS[FUEL_LEVELS[booking.return_fuel_level]]
                          : '-'
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Km recorridos</span>
                      <p className="font-medium">
                        {booking.pickup_mileage 
                          ? (booking.return_mileage - booking.pickup_mileage).toLocaleString()
                          : '-'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Extras */}
          {booking.extras && booking.extras.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Extras</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {booking.extras.map((extra: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-secondary" />
                        <span>{extra.extra_name}</span>
                        {extra.quantity > 1 && (
                          <Badge variant="secondary" className="text-xs">×{extra.quantity}</Badge>
                        )}
                      </div>
                      <span className="font-medium">{formatPrice(extra.total_price)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Notes */}
          {booking.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Notas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{booking.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <CustomerInfo customer={booking.customer} />
          
          {/* Payment Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Resumen de pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Alquiler ({totalDays} días)</span>
                <span>{formatPrice(booking.base_price)}</span>
              </div>
              
              {booking.extras_total > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Extras</span>
                  <span>{formatPrice(booking.extras_total)}</span>
                </div>
              )}
              
              {booking.location_surcharge > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Recargo devolución</span>
                  <span>{formatPrice(booking.location_surcharge)}</span>
                </div>
              )}
              
              {booking.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-secondary">
                  <span>Descuento {booking.discount_code && `(${booking.discount_code})`}</span>
                  <span>-{formatPrice(booking.discount_amount)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(booking.subtotal)}</span>
              </div>
              
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>IVA (21%)</span>
                <span>{formatPrice(booking.tax_amount)}</span>
              </div>
              
              {/* Additional charges */}
              {(booking.damage_charges > 0 || booking.fuel_charges > 0 || booking.cleaning_charges > 0 || booking.extra_km_charges > 0) && (
                <>
                  <Separator />
                  <p className="text-sm font-medium">Cargos adicionales:</p>
                  {booking.damage_charges > 0 && (
                    <div className="flex justify-between text-sm text-destructive">
                      <span>Daños</span>
                      <span>{formatPrice(booking.damage_charges)}</span>
                    </div>
                  )}
                  {booking.fuel_charges > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Combustible</span>
                      <span>{formatPrice(booking.fuel_charges)}</span>
                    </div>
                  )}
                  {booking.extra_km_charges > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Km extra</span>
                      <span>{formatPrice(booking.extra_km_charges)}</span>
                    </div>
                  )}
                </>
              )}
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(booking.total_price)}
                </span>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">Estado</span>
                <Badge variant={booking.is_paid ? 'default' : 'outline'} className={booking.is_paid ? 'bg-secondary' : ''}>
                  {booking.is_paid ? 'Pagado' : 'Pendiente'}
                </Badge>
              </div>
              
              {booking.payment_method && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Método</span>
                  <span className="text-sm capitalize">{booking.payment_method}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fianza</span>
                <span className="text-sm font-medium">{formatPrice(booking.deposit_amount)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Dialogs */}
      <StartRentalDialog
        open={showStartDialog}
        onOpenChange={setShowStartDialog}
        booking={booking}
        onConfirm={handleStartRental}
        isLoading={startRentalMutation.isPending}
      />
      
      <CompleteRentalDialog
        open={showCompleteDialog}
        onOpenChange={setShowCompleteDialog}
        booking={booking}
        onConfirm={handleCompleteRental}
        isLoading={completeRentalMutation.isPending}
      />
      
      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Cancelar reserva"
        description={`¿Estás seguro de que quieres cancelar la reserva ${booking.booking_number}?`}
        confirmText="Cancelar reserva"
        variant="destructive"
        isLoading={cancelMutation.isPending}
        onConfirm={handleCancel}
      />
      
      <ContractPreviewDialog
        open={showContractPreview}
        onOpenChange={setShowContractPreview}
        bookingId={booking.id}
        bookingNumber={booking.booking_number}
      />
      
      <ContractSignDialog
        open={showContractSign}
        onOpenChange={setShowContractSign}
        bookingId={booking.id}
        bookingNumber={booking.booking_number}
        customerName={booking.customer ? `${booking.customer.first_name} ${booking.customer.last_name}` : 'Cliente'}
        onSigned={() => {
          refetch();
        }}
      />
    </div>
  );
}
