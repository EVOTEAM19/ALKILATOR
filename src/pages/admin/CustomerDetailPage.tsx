import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Car,
  Edit,
  Trash2,
  Ban,
  CheckCircle2,
  AlertTriangle,
  MoreHorizontal,
  FileText,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  useCustomer, 
  useCustomerBookings, 
  useDeleteCustomer, 
  useToggleBlacklist 
} from '@/hooks/useCustomers';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS, DOCUMENT_TYPE_LABELS } from '@/lib/constants';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

// Información de contacto
function ContactInfo({ label, value, icon: Icon, href }: { 
  label: string; 
  value: string; 
  icon: any;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-3 py-2">
      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
  
  if (href) {
    return (
      <a href={href} className="block hover:bg-muted/50 rounded-lg -mx-2 px-2 transition-colors">
        {content}
      </a>
    );
  }
  
  return content;
}

// Estadísticas del cliente
function CustomerStats({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center p-4 rounded-lg bg-primary/10">
        <p className="text-3xl font-bold text-primary">{stats?.totalBookings || 0}</p>
        <p className="text-xs text-muted-foreground">Reservas totales</p>
      </div>
      <div className="text-center p-4 rounded-lg bg-secondary/10">
        <p className="text-3xl font-bold text-secondary">{stats?.completedBookings || 0}</p>
        <p className="text-xs text-muted-foreground">Completadas</p>
      </div>
      <div className="text-center p-4 rounded-lg bg-muted">
        <p className="text-3xl font-bold">{formatPrice(stats?.totalSpent || 0)}</p>
        <p className="text-xs text-muted-foreground">Total facturado</p>
      </div>
      <div className="text-center p-4 rounded-lg bg-orange-500/10">
        <p className="text-3xl font-bold text-orange-500">{stats?.cancelledBookings || 0}</p>
        <p className="text-xs text-muted-foreground">Canceladas</p>
      </div>
    </div>
  );
}

// Historial de reservas
function BookingHistory({ customerId }: { customerId: string }) {
  const { data: bookings, isLoading } = useCustomerBookings(customerId);
  
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
            <Car className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium">{booking.vehicle_group?.name}</span>
              <Badge variant="outline" className="text-xs">
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

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: customer, isLoading, error } = useCustomer(id!);
  
  const deleteMutation = useDeleteCustomer();
  const blacklistMutation = useToggleBlacklist();
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBlacklistDialog, setShowBlacklistDialog] = useState(false);
  
  const handleDelete = async () => {
    await deleteMutation.mutateAsync(id!);
    navigate('/admin/clientes');
  };
  
  const handleToggleBlacklist = async () => {
    await blacklistMutation.mutateAsync({
      id: id!,
      isBlacklisted: !customer?.is_blocked,
      reason: customer?.is_blocked ? undefined : 'Motivo a definir',
    });
    setShowBlacklistDialog(false);
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
  
  if (error || !customer) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Cliente no encontrado</h2>
        <p className="text-muted-foreground mb-4">
          No pudimos encontrar el cliente que buscas
        </p>
        <Button onClick={() => navigate('/admin/clientes')}>
          Volver a clientes
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/clientes')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-14 w-14">
            <AvatarFallback className={cn(
              'text-lg',
              customer.is_blocked ? 'bg-destructive/20 text-destructive' : 'bg-primary/10 text-primary'
            )}>
              {customer.first_name?.charAt(0)}{customer.last_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                {customer.first_name} {customer.last_name}
              </h1>
              {customer.is_blocked && (
                <Badge variant="destructive">
                  <Ban className="h-3 w-3 mr-1" />
                  Lista negra
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Badge variant="outline">
                <User className="h-3 w-3 mr-1" />
                Particular
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link to={`/admin/reservas/nueva?customer=${customer.id}`}>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Nueva reserva
            </Button>
          </Link>
          <Link to={`/admin/clientes/${customer.id}/editar`}>
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
              {customer.is_blocked ? (
                <DropdownMenuItem onClick={() => handleToggleBlacklist()}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Quitar de lista negra
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem 
                  onClick={() => setShowBlacklistDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Añadir a lista negra
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar cliente
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Blacklist Alert */}
      {customer.is_blocked && (
        <Alert variant="destructive">
          <Ban className="h-4 w-4" />
          <AlertDescription>
            <strong>Cliente en lista negra.</strong>
            {customer.block_reason && (
              <> Motivo: {customer.block_reason}</>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información de contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <ContactInfo 
                label="Email" 
                value={customer.email} 
                icon={Mail}
                href={`mailto:${customer.email}`}
              />
              {customer.phone && (
                <ContactInfo 
                  label="Teléfono" 
                  value={customer.phone} 
                  icon={Phone}
                  href={`tel:${customer.phone}`}
                />
              )}
              {customer.address && (
                <ContactInfo 
                  label="Dirección" 
                  value={`${customer.address}${customer.city ? `, ${customer.city}` : ''}${customer.postal_code ? ` ${customer.postal_code}` : ''}${customer.country ? `, ${customer.country}` : ''}`}
                  icon={MapPin}
                />
              )}
            </CardContent>
          </Card>
          
          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Documentación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Documento de identidad</p>
                  <p className="font-medium">
                    {customer.document_type ? DOCUMENT_TYPE_LABELS[customer.document_type] : '-'}: {customer.document_number || '-'}
                  </p>
                </div>
                {customer.birth_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de nacimiento</p>
                    <p className="font-medium">
                      {format(parseISO(customer.birth_date), 'dd/MM/yyyy')}
                    </p>
                  </div>
                )}
                {customer.license_number && (
                  <div>
                    <p className="text-sm text-muted-foreground">Carnet de conducir</p>
                    <p className="font-medium">{customer.license_number}</p>
                  </div>
                )}
                {customer.license_issue_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Expedido</p>
                    <p className="font-medium">
                      {format(parseISO(customer.license_issue_date), 'dd/MM/yyyy')} ({customer.license_country || 'España'})
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Booking History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Historial de reservas</CardTitle>
                <Link to={`/admin/reservas?customer=${customer.id}`}>
                  <Button variant="ghost" size="sm">
                    Ver todas
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <BookingHistory customerId={customer.id} />
            </CardContent>
          </Card>
          
          {/* Notes */}
          {customer.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Notas internas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{customer.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerStats stats={customer.stats} />
            </CardContent>
          </Card>
          
          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Cliente desde</span>
                <span>{format(parseISO(customer.created_at), 'dd/MM/yyyy')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Última actualización</span>
                <span>{format(parseISO(customer.updated_at), 'dd/MM/yyyy')}</span>
              </div>
              {customer.user_id && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Cuenta vinculada</span>
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Sí
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Dialogs */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Eliminar cliente"
        description={`¿Estás seguro de que quieres eliminar el cliente ${customer.first_name} ${customer.last_name}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
      
      <ConfirmDialog
        open={showBlacklistDialog}
        onOpenChange={setShowBlacklistDialog}
        title="Añadir a lista negra"
        description={`¿Estás seguro de que quieres añadir a ${customer.first_name} ${customer.last_name} a la lista negra?`}
        confirmText="Añadir a lista negra"
        variant="destructive"
        isLoading={blacklistMutation.isPending}
        onConfirm={handleToggleBlacklist}
      />
    </div>
  );
}
