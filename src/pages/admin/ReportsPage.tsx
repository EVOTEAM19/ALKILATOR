import { useState } from 'react';
import { format, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Car,
  Users,
  DollarSign,
  Wrench,
  Filter,
  RefreshCw,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  useBookingsReport,
  useFleetReport,
  useFinancialReport,
  useExportBookings,
  useExportCustomers,
  useExportVehicles,
  useExportMaintenances,
} from '@/hooks/useReports';
import type { ReportFilters } from '@/services/reportService';
import { BOOKING_STATUS_LABELS, VEHICLE_STATUS_LABELS } from '@/lib/constants';

const CHART_COLORS = ['#0066CC', '#00CC66', '#FF9500', '#AF52DE', '#FF3B30', '#5AC8FA', '#34C759', '#FF2D55'];

// Períodos predefinidos
const PERIODS = [
  { value: 'this_month', label: 'Este mes' },
  { value: 'last_month', label: 'Mes anterior' },
  { value: 'last_3_months', label: 'Últimos 3 meses' },
  { value: 'last_6_months', label: 'Últimos 6 meses' },
  { value: 'this_year', label: 'Este año' },
  { value: 'last_year', label: 'Año anterior' },
  { value: 'custom', label: 'Personalizado' },
];

// Métricas card
function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'primary',
  isLoading,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  trend?: 'up' | 'down';
  trendValue?: string;
  color?: 'primary' | 'green' | 'orange' | 'red';
  isLoading?: boolean;
}) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    green: 'bg-green-500/10 text-green-500',
    orange: 'bg-orange-500/10 text-orange-500',
    red: 'bg-destructive/10 text-destructive',
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
            <Skeleton className="h-12 w-12 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {(subtitle || trend) && (
              <div className="flex items-center gap-2 mt-1">
                {trend && (
                  <span className={cn(
                    'flex items-center text-xs',
                    trend === 'up' ? 'text-green-500' : 'text-destructive'
                  )}>
                    {trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {trendValue}
                  </span>
                )}
                {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
              </div>
            )}
          </div>
          <div className={cn('h-12 w-12 rounded-lg flex items-center justify-center', colorClasses[color])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Selector de período
function PeriodSelector({
  filters,
  onFiltersChange,
}: {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
}) {
  const [period, setPeriod] = useState('this_month');

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    const now = new Date();

    let startDate: Date;
    let endDate: Date;

    switch (value) {
      case 'this_month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'last_month':
        startDate = startOfMonth(subMonths(now, 1));
        endDate = endOfMonth(subMonths(now, 1));
        break;
      case 'last_3_months':
        startDate = startOfMonth(subMonths(now, 2));
        endDate = endOfMonth(now);
        break;
      case 'last_6_months':
        startDate = startOfMonth(subMonths(now, 5));
        endDate = endOfMonth(now);
        break;
      case 'this_year':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      case 'last_year':
        startDate = startOfYear(subMonths(now, 12));
        endDate = endOfYear(subMonths(now, 12));
        break;
      default:
        return;
    }

    onFiltersChange({
      ...filters,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={period} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-[180px]">
          <Calendar className="h-4 w-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PERIODS.map(p => (
            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {period === 'custom' && (
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                {filters.startDate ? format(new Date(filters.startDate), 'dd/MM/yy') : 'Inicio'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={filters.startDate ? new Date(filters.startDate) : undefined}
                onSelect={(date) => date && onFiltersChange({
                  ...filters,
                  startDate: format(date, 'yyyy-MM-dd'),
                })}
                locale={es}
              />
            </PopoverContent>
          </Popover>
          <span>-</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                {filters.endDate ? format(new Date(filters.endDate), 'dd/MM/yy') : 'Fin'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={filters.endDate ? new Date(filters.endDate) : undefined}
                onSelect={(date) => date && onFiltersChange({
                  ...filters,
                  endDate: format(date, 'yyyy-MM-dd'),
                })}
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}

// Reporte de Reservas
function BookingsReportTab({ filters }: { filters: ReportFilters }) {
  const { data: report, isLoading, refetch } = useBookingsReport(filters);
  const exportMutation = useExportBookings();

  const handleExport = (format: 'excel' | 'csv' | 'pdf') => {
    exportMutation.mutate({ filters, format });
  };

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total reservas"
          value={report?.totalBookings || 0}
          subtitle={`${report?.completedBookings || 0} completadas`}
          icon={Calendar}
          color="primary"
          isLoading={isLoading}
        />
        <MetricCard
          title="Ingresos"
          value={formatPrice(report?.totalRevenue || 0)}
          subtitle={`Ticket medio: ${formatPrice(report?.averageBookingValue || 0)}`}
          icon={DollarSign}
          color="green"
          isLoading={isLoading}
        />
        <MetricCard
          title="Duración media"
          value={`${(report?.averageDuration || 0).toFixed(1)} días`}
          icon={Calendar}
          color="primary"
          isLoading={isLoading}
        />
        <MetricCard
          title="Tasa ocupación"
          value={`${(report?.occupancyRate || 0).toFixed(1)}%`}
          icon={BarChart3}
          color={report?.occupancyRate && report.occupancyRate > 50 ? 'green' : 'orange'}
          isLoading={isLoading}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolución mensual */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evolución de reservas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px]" />
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={report?.bookingsByMonth || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === 'revenue' ? formatPrice(value) : value,
                        name === 'count' ? 'Reservas' : 'Ingresos',
                      ]}
                    />
                    <Area type="monotone" dataKey="count" stroke="#0066CC" fill="#0066CC" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Por estado */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por estado</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px]" />
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={report?.bookingsByStatus?.map(s => ({
                        ...s,
                        name: BOOKING_STATUS_LABELS[s.status] || s.status,
                      })) || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {report?.bookingsByStatus?.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Por grupo y ubicación */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por grupo de vehículos</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {report?.bookingsByGroup?.map((item, i) => (
                  <div key={item.group} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                    <span className="flex-1 text-sm">{item.group}</span>
                    <Badge variant="outline">{item.count}</Badge>
                    <span className="text-sm font-medium w-24 text-right">
                      {formatPrice(item.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top clientes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {report?.topCustomers?.slice(0, 5).map((customer, i) => (
                  <div key={customer.name} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm truncate">{customer.name}</span>
                    <Badge variant="outline">{customer.bookings} reservas</Badge>
                    <span className="text-sm font-medium">
                      {formatPrice(customer.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Exportar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Exportar datos</p>
              <p className="text-sm text-muted-foreground">
                Descarga el informe de reservas en el formato que prefieras
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={exportMutation.isPending}>
                  {exportMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Exportar
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <FileText className="h-4 w-4 mr-2" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Reporte de Flota
function FleetReportTab({ filters }: { filters: ReportFilters }) {
  const { data: report, isLoading } = useFleetReport(filters);
  const exportMutation = useExportVehicles();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total vehículos"
          value={report?.totalVehicles || 0}
          subtitle={`${report?.activeVehicles || 0} activos`}
          icon={Car}
          isLoading={isLoading}
        />
        <MetricCard
          title="Tasa utilización"
          value={`${(report?.utilizationRate || 0).toFixed(1)}%`}
          icon={BarChart3}
          color={report?.utilizationRate && report.utilizationRate > 60 ? 'green' : 'orange'}
          isLoading={isLoading}
        />
        <MetricCard
          title="Coste mantenimiento"
          value={formatPrice(report?.maintenanceCosts || 0)}
          subtitle="En el período"
          icon={Wrench}
          color="orange"
          isLoading={isLoading}
        />
        <MetricCard
          title="Km promedio"
          value={`${Math.round(report?.averageMileage || 0).toLocaleString()}`}
          subtitle="Por vehículo"
          icon={Car}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por estado</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px]" />
            ) : (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report?.vehiclesByStatus?.map(s => ({
                    ...s,
                    name: VEHICLE_STATUS_LABELS[s.status] || s.status,
                  })) || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0066CC" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por grupo</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {report?.vehiclesByGroup?.map((item, i) => {
                  const percentage = report.totalVehicles > 0
                    ? (item.count / report.totalVehicles) * 100
                    : 0;
                  return (
                    <div key={item.group}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{item.group}</span>
                        <span className="text-sm font-medium">{item.count}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {report?.vehiclesNeedingMaintenance && report.vehiclesNeedingMaintenance > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Wrench className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium text-orange-800">
                  {report.vehiclesNeedingMaintenance} vehículo(s) requieren mantenimiento
                </p>
                <p className="text-sm text-orange-600">
                  Hay mantenimientos programados pendientes o atrasados
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Exportar flota</p>
              <p className="text-sm text-muted-foreground">
                Descarga el listado completo de vehículos
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={exportMutation.isPending}>
                  {exportMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Exportar
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => exportMutation.mutate('excel')}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportMutation.mutate('csv')}>
                  <FileText className="h-4 w-4 mr-2" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportMutation.mutate('pdf')}>
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Reporte Financiero
function FinancialReportTab({ filters }: { filters: ReportFilters }) {
  const { data: report, isLoading } = useFinancialReport(filters);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Ingresos"
          value={formatPrice(report?.totalRevenue || 0)}
          icon={TrendingUp}
          color="green"
          isLoading={isLoading}
        />
        <MetricCard
          title="Gastos"
          value={formatPrice(report?.totalExpenses || 0)}
          icon={TrendingDown}
          color="orange"
          isLoading={isLoading}
        />
        <MetricCard
          title="Beneficio neto"
          value={formatPrice(report?.netProfit || 0)}
          icon={DollarSign}
          color={report?.netProfit && report.netProfit >= 0 ? 'green' : 'red'}
          isLoading={isLoading}
        />
        <MetricCard
          title="Margen"
          value={`${(report?.profitMargin || 0).toFixed(1)}%`}
          icon={BarChart3}
          color={report?.profitMargin && report.profitMargin > 20 ? 'green' : 'orange'}
          isLoading={isLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evolución financiera</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px]" />
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report?.revenueByMonth || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatPrice(value)} />
                  <Legend />
                  <Bar dataKey="revenue" name="Ingresos" fill="#00CC66" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Gastos" fill="#FF9500" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ingresos por categoría</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px]" />
            ) : (
              <div className="space-y-3">
                {report?.revenueByCategory?.map((item, i) => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                        <span className="text-sm">{item.category}</span>
                      </div>
                      <span className="text-sm font-medium">{formatPrice(item.amount)}</span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gastos por tipo</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px]" />
            ) : report?.topExpenseCategories?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Sin gastos registrados</p>
            ) : (
              <div className="space-y-3">
                {report?.topExpenseCategories?.map((item) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{item.category.replace('_', ' ')}</span>
                    <span className="text-sm font-medium">{formatPrice(item.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {report?.pendingPayments && report.pendingPayments > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">
                  {formatPrice(report.pendingPayments)} pendientes de cobro
                </p>
                <p className="text-sm text-yellow-600">
                  Hay reservas confirmadas sin pagar
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Página principal
export default function ReportsPage() {
  const [filters, setFilters] = useState<ReportFilters>(() => {
    const now = new Date();
    return {
      startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Informes</h1>
          <p className="text-muted-foreground">
            Análisis y reportes de tu negocio
          </p>
        </div>
        <PeriodSelector filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="bookings" className="gap-2">
            <Calendar className="h-4 w-4" />
            Reservas
          </TabsTrigger>
          <TabsTrigger value="fleet" className="gap-2">
            <Car className="h-4 w-4" />
            Flota
          </TabsTrigger>
          <TabsTrigger value="financial" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Financiero
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <BookingsReportTab filters={filters} />
        </TabsContent>

        <TabsContent value="fleet">
          <FleetReportTab filters={filters} />
        </TabsContent>

        <TabsContent value="financial">
          <FinancialReportTab filters={filters} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
