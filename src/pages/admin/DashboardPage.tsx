import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar,
  Car,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
  Wrench,
  AlertCircle,
  Activity,
  BarChart3,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useDashboardStats,
  useRecentBookings,
  useUpcomingMaintenance,
  useRevenueByMonth,
} from '@/hooks/useDashboard';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS, MAINTENANCE_TYPE_LABELS } from '@/lib/constants';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

// Componente de tarjeta de estadística
function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor,
  isLoading,
  prefix,
  suffix,
}: {
  title: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  icon: any;
  iconColor: string;
  isLoading?: boolean;
  prefix?: string;
  suffix?: string;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-12 w-12 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const isPositive = change !== undefined && change >= 0;
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">
              {prefix}{typeof value === 'number' ? value.toLocaleString('es-ES') : value}{suffix}
            </p>
            {change !== undefined && (
              <div className={cn(
                'flex items-center gap-1 text-sm mt-2',
                isPositive ? 'text-secondary' : 'text-destructive'
              )}>
                {isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{isPositive ? '+' : ''}{change}%</span>
                {changeLabel && (
                  <span className="text-muted-foreground">{changeLabel}</span>
                )}
              </div>
            )}
          </div>
          <div className={cn('h-12 w-12 rounded-lg flex items-center justify-center', iconColor)}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de reservas recientes
function RecentBookingsList() {
  const { data: bookings, isLoading, error } = useRecentBookings(5);
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    );
  }
  
  if (error || !bookings?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No hay reservas recientes</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
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
              <p className="font-medium truncate">{booking.customer_name}</p>
              <Badge variant="outline" className="shrink-0 text-xs">
                {booking.booking_number}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {booking.vehicle_group} • {format(parseISO(booking.pickup_date), 'dd MMM', { locale: es })}
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

// Componente de mantenimientos próximos
function UpcomingMaintenanceList() {
  const { data: maintenances, isLoading, error } = useUpcomingMaintenance(5);
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    );
  }
  
  if (error || !maintenances?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Wrench className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No hay mantenimientos pendientes</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {maintenances.map((maintenance) => (
        <Link
          key={maintenance.id}
          to={`/admin/mantenimientos`}
          className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
        >
          <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
            <Wrench className="h-5 w-5 text-orange-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{maintenance.vehicle}</p>
            <p className="text-sm text-muted-foreground">
              {maintenance.plate} • {MAINTENANCE_TYPE_LABELS[maintenance.type] || maintenance.type}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm text-muted-foreground">
              {format(parseISO(maintenance.scheduled_date), 'dd MMM', { locale: es })}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

// Gráfico de ingresos
function RevenueChart() {
  const { data: revenueData, isLoading } = useRevenueByMonth();
  
  if (isLoading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }
  
  if (!revenueData?.length) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No hay datos suficientes</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0066CC" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0066CC" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            className="text-xs"
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            className="text-xs"
            tickFormatter={(value) => `${value / 1000}k`}
          />
          <Tooltip 
            formatter={(value: number) => [formatPrice(value), 'Ingresos']}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#0066CC" 
            strokeWidth={2}
            fill="url(#colorRevenue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Página principal del Dashboard
export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen de tu negocio en tiempo real
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/reservas/nueva">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Nueva reserva
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Reservas este mes"
          value={stats?.totalBookings || 0}
          change={stats?.bookingsChange}
          changeLabel="vs mes anterior"
          icon={Calendar}
          iconColor="bg-primary"
          isLoading={statsLoading}
        />
        <StatCard
          title="Ingresos"
          value={formatPrice(stats?.revenue || 0)}
          change={stats?.revenueChange}
          changeLabel="vs mes anterior"
          icon={DollarSign}
          iconColor="bg-secondary"
          isLoading={statsLoading}
        />
        <StatCard
          title="Reservas activas"
          value={stats?.activeBookings || 0}
          icon={Activity}
          iconColor="bg-orange-500"
          isLoading={statsLoading}
        />
        <StatCard
          title="Clientes"
          value={stats?.totalCustomers || 0}
          change={stats?.customersChange}
          changeLabel="nuevos este mes"
          icon={Users}
          iconColor="bg-purple-500"
          isLoading={statsLoading}
        />
      </div>
      
      {/* Fleet Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            Estado de la flota
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Ocupación</span>
                <span className="font-medium">{stats?.occupancyRate || 0}%</span>
              </div>
              <Progress value={stats?.occupancyRate || 0} className="h-2" />
            </div>
            <div className="text-center px-4 border-l">
              <p className="text-3xl font-bold text-primary">{stats?.fleetSize || 0}</p>
              <p className="text-sm text-muted-foreground">Total vehículos</p>
            </div>
            <div className="text-center px-4 border-l">
              <p className="text-3xl font-bold text-secondary">{stats?.availableVehicles || 0}</p>
              <p className="text-sm text-muted-foreground">Disponibles</p>
            </div>
            <div className="text-center px-4 border-l">
              <p className="text-3xl font-bold text-orange-500">
                {(stats?.fleetSize || 0) - (stats?.availableVehicles || 0)}
              </p>
              <p className="text-sm text-muted-foreground">En alquiler</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium">Ingresos</CardTitle>
                <CardDescription>Evolución de los últimos 6 meses</CardDescription>
              </div>
              <Link to="/admin/contabilidad">
                <Button variant="ghost" size="sm">
                  Ver más
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>
        
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Últimas reservas</CardTitle>
              <Link to="/admin/reservas">
                <Button variant="ghost" size="sm">
                  Ver todas
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <RecentBookingsList />
          </CardContent>
        </Card>
      </div>
      
      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Maintenance */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-orange-500" />
                  Mantenimientos próximos
                </CardTitle>
              </div>
              <Link to="/admin/mantenimientos">
                <Button variant="ghost" size="sm">
                  Ver todos
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <UpcomingMaintenanceList />
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Acciones rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/admin/reservas/nueva">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="text-sm">Nueva reserva</span>
                </Button>
              </Link>
              <Link to="/admin/flota/vehiculos/nuevo">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  <span className="text-sm">Añadir vehículo</span>
                </Button>
              </Link>
              <Link to="/admin/clientes">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-sm">Ver clientes</span>
                </Button>
              </Link>
              <Link to="/admin/contabilidad">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="text-sm">Contabilidad</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
