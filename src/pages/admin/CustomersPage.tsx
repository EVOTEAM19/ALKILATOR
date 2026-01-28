import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Users,
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
  User,
  Building2,
  Mail,
  Phone,
  AlertTriangle,
  Ban,
  CheckCircle2,
  X,
  Calendar,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { Textarea } from '@/components/ui/textarea';
import { 
  useCustomers, 
  useCustomerStats, 
  useDeleteCustomer,
  useToggleBlacklist 
} from '@/hooks/useCustomers';
import type { CustomerFilters, Customer } from '@/types';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

// Componente de estadística
function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  color 
}: { 
  label: string; 
  value: number; 
  icon: any;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
      <div className={cn('h-12 w-12 rounded-lg flex items-center justify-center', color)}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

// Diálogo de lista negra
function BlacklistDialog({
  open,
  onOpenChange,
  customer,
  onConfirm,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}) {
  const [reason, setReason] = useState('');
  
  const handleConfirm = () => {
    onConfirm(reason);
    setReason('');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Ban className="h-5 w-5" />
            Añadir a lista negra
          </DialogTitle>
          <DialogDescription>
            El cliente {customer?.first_name} {customer?.last_name} no podrá realizar nuevas reservas.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo *</Label>
            <Textarea
              id="reason"
              placeholder="Indica el motivo para añadir a lista negra..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason.trim() || isLoading}
          >
            {isLoading ? 'Procesando...' : 'Añadir a lista negra'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Fila de la tabla
function CustomerRow({ 
  customer, 
  onBlacklist,
  onRemoveBlacklist,
  onDelete 
}: { 
  customer: Customer;
  onBlacklist: () => void;
  onRemoveBlacklist: () => void;
  onDelete: () => void;
}) {
  return (
    <TableRow className={cn('hover:bg-muted/50', customer.is_blocked && 'bg-destructive/5')}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className={cn(
              customer.is_blocked ? 'bg-destructive/20 text-destructive' : 'bg-primary/10 text-primary'
            )}>
              {customer.first_name?.charAt(0)}{customer.last_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <Link 
                to={`/admin/clientes/${customer.id}`}
                className="font-medium hover:text-primary transition-colors"
              >
                {customer.first_name} {customer.last_name}
              </Link>
              {customer.is_blocked && (
                <Badge variant="destructive" className="text-xs">
                  <Ban className="h-3 w-3 mr-1" />
                  Bloqueado
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {customer.document_type?.toUpperCase()}: {customer.document_number || '-'}
            </p>
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <Badge variant="outline">
          <User className="h-3 w-3 mr-1" />
          Particular
        </Badge>
      </TableCell>
      
      <TableCell>
        <div className="space-y-1">
          <a 
            href={`mailto:${customer.email}`}
            className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
          >
            <Mail className="h-3 w-3" />
            {customer.email}
          </a>
          {customer.phone && (
            <a 
              href={`tel:${customer.phone}`}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Phone className="h-3 w-3" />
              {customer.phone}
            </a>
          )}
        </div>
      </TableCell>
      
      <TableCell>
        <span className="text-sm">
          {format(parseISO(customer.created_at), 'dd/MM/yyyy')}
        </span>
      </TableCell>
      
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/admin/clientes/${customer.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                Ver detalle
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/admin/clientes/${customer.id}/editar`}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {customer.is_blocked ? (
              <DropdownMenuItem onClick={onRemoveBlacklist}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Quitar de lista negra
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem 
                onClick={onBlacklist}
                className="text-destructive focus:text-destructive"
              >
                <Ban className="h-4 w-4 mr-2" />
                Añadir a lista negra
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
      </TableCell>
    </TableRow>
  );
}

// Página principal
export default function CustomersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [customerToBlacklist, setCustomerToBlacklist] = useState<Customer | null>(null);
  
  // Filtros desde URL
  const filters: CustomerFilters = useMemo(() => ({
    isBlacklisted: searchParams.get('blacklisted') === 'true' ? true : 
                   searchParams.get('blacklisted') === 'false' ? false : undefined,
    search: searchParams.get('search') || undefined,
  }), [searchParams]);
  
  const page = parseInt(searchParams.get('page') || '1');
  
  // Queries
  const { data: customersData, isLoading, refetch } = useCustomers(filters, page, 20);
  const { data: stats } = useCustomerStats();
  
  const deleteMutation = useDeleteCustomer();
  const blacklistMutation = useToggleBlacklist();
  
  // Actualizar filtros
  const updateFilters = (newFilters: CustomerFilters) => {
    const params = new URLSearchParams();
    
    if (newFilters.isBlacklisted !== undefined) params.set('blacklisted', newFilters.isBlacklisted.toString());
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
    if (customerToDelete) {
      await deleteMutation.mutateAsync(customerToDelete.id);
      setCustomerToDelete(null);
    }
  };
  
  const handleBlacklist = async (reason: string) => {
    if (customerToBlacklist) {
      await blacklistMutation.mutateAsync({
        id: customerToBlacklist.id,
        isBlacklisted: true,
        reason,
      });
      setCustomerToBlacklist(null);
    }
  };
  
  const handleRemoveBlacklist = async (customer: Customer) => {
    await blacklistMutation.mutateAsync({
      id: customer.id,
      isBlacklisted: false,
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">
            Gestiona los clientes de tu empresa
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Link to="/admin/clientes/nuevo">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo cliente
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          label="Total clientes"
          value={stats?.total || 0}
          icon={Users}
          color="bg-primary"
        />
        <StatCard
          label="Particulares"
          value={stats?.individuals || 0}
          icon={User}
          color="bg-blue-500"
        />
        <StatCard
          label="Empresas"
          value={stats?.businesses || 0}
          icon={Building2}
          color="bg-purple-500"
        />
        <StatCard
          label="Nuevos este mes"
          value={stats?.newThisMonth || 0}
          icon={Calendar}
          color="bg-secondary"
        />
        <StatCard
          label="Lista negra"
          value={stats?.blacklisted || 0}
          icon={Ban}
          color="bg-destructive"
        />
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email, teléfono, documento..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleSearch}>Buscar</Button>
            </div>
            
            {/* Quick filters */}
            <div className="flex gap-2">
              <Select
                value={filters.isBlacklisted === undefined ? 'all' : filters.isBlacklisted.toString()}
                onValueChange={(v) => updateFilters({ 
                  ...filters, 
                  isBlacklisted: v === 'all' ? undefined : v === 'true' 
                })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="false">Activos</SelectItem>
                  <SelectItem value="true">Bloqueados</SelectItem>
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
      
      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-24" />
                </div>
              ))}
            </div>
          ) : customersData?.data.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay clientes</h3>
              <p className="text-muted-foreground mb-4">
                {Object.values(filters).some(v => v !== undefined)
                  ? 'No se encontraron clientes con los filtros aplicados'
                  : 'Aún no tienes clientes registrados'
                }
              </p>
              <div className="flex justify-center gap-3">
                {Object.values(filters).some(v => v !== undefined) && (
                  <Button variant="outline" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                )}
                <Link to="/admin/clientes/nuevo">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir cliente
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Registro</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customersData?.data.map((customer) => (
                    <CustomerRow
                      key={customer.id}
                      customer={customer}
                      onBlacklist={() => setCustomerToBlacklist(customer)}
                      onRemoveBlacklist={() => handleRemoveBlacklist(customer)}
                      onDelete={() => setCustomerToDelete(customer)}
                    />
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {customersData && customersData.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {((page - 1) * 20) + 1} - {Math.min(page * 20, customersData.count)} de {customersData.count} clientes
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
                      Página {page} de {customersData.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= customersData.totalPages}
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
      
      {/* Delete Dialog */}
      <ConfirmDialog
        open={!!customerToDelete}
        onOpenChange={(open) => !open && setCustomerToDelete(null)}
        title="Eliminar cliente"
        description={`¿Estás seguro de que quieres eliminar el cliente ${customerToDelete?.first_name} ${customerToDelete?.last_name}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
      
      {/* Blacklist Dialog */}
      <BlacklistDialog
        open={!!customerToBlacklist}
        onOpenChange={(open) => !open && setCustomerToBlacklist(null)}
        customer={customerToBlacklist}
        onConfirm={handleBlacklist}
        isLoading={blacklistMutation.isPending}
      />
    </div>
  );
}
