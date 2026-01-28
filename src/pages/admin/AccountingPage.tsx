import { useState } from 'react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  FileText,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Search,
  MoreHorizontal,
  Eye,
  Receipt
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
} from 'recharts';
import { 
  useFinancialSummary, 
  useRevenueByMonth, 
  useRevenueByCategory,
  useInvoices,
  useYearlyTotals,
  useMarkAsPaid
} from '@/hooks/useAccounting';
import { Link } from 'react-router-dom';

const CHART_COLORS = ['#0066CC', '#00CC66', '#FF9500', '#AF52DE', '#FF3B30', '#5AC8FA'];

// Tarjeta de métrica
function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor,
  trend,
  isLoading,
}: {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: any;
  iconColor: string;
  trend?: 'up' | 'down';
  isLoading?: boolean;
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
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {change !== undefined && (
              <div className={cn(
                'flex items-center gap-1 text-sm mt-2',
                trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
              )}>
                {trend === 'up' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : trend === 'down' ? (
                  <TrendingDown className="h-4 w-4" />
                ) : null}
                <span>{change > 0 ? '+' : ''}{change}%</span>
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

// Gráfico de ingresos
function RevenueChart() {
  const { data, isLoading } = useRevenueByMonth(12);
  
  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }
  
  if (!data?.length) {
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
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0066CC" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0066CC" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00CC66" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00CC66" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="period" 
            axisLine={false}
            tickLine={false}
            className="text-xs"
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            className="text-xs"
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip 
            formatter={(value: number, name: string) => [
              formatPrice(value), 
              name === 'revenue' ? 'Ingresos' : name === 'profit' ? 'Beneficio' : 'Gastos'
            ]}
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
          <Area 
            type="monotone" 
            dataKey="profit" 
            stroke="#00CC66" 
            strokeWidth={2}
            fill="url(#colorProfit)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Gráfico de categorías
function CategoryChart() {
  const { data, isLoading } = useRevenueByCategory();
  
  if (isLoading) {
    return <Skeleton className="h-[250px] w-full" />;
  }
  
  if (!data?.length) {
    return (
      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <PieChart className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No hay datos</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPie>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="amount"
            nameKey="category"
            label={({ category, percentage }) => `${category} (${percentage}%)`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => formatPrice(value)}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
        </RechartsPie>
      </ResponsiveContainer>
    </div>
  );
}

// Lista de facturas
function InvoicesList() {
  const [filters, setFilters] = useState<{ status?: string; search?: string }>({});
  const [page, setPage] = useState(1);
  
  const { data: invoicesData, isLoading } = useInvoices(filters, page, 10);
  const markAsPaidMutation = useMarkAsPaid();
  
  const handleMarkAsPaid = async (bookingId: string) => {
    await markAsPaidMutation.mutateAsync({ bookingId });
  };
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número de reserva..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>
        <Select
          value={filters.status || 'all'}
          onValueChange={(v) => setFilters({ ...filters, status: v === 'all' ? undefined : v })}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="paid">Pagados</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Table */}
      {invoicesData?.data.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Receipt className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>No hay facturas</p>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reserva</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoicesData?.data.map((invoice: any) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <Link 
                      to={`/admin/reservas/${invoice.id}`}
                      className="font-mono font-medium text-primary hover:underline"
                    >
                      {invoice.booking_number}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{invoice.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{invoice.customer_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {format(new Date(invoice.issue_date), 'dd/MM/yyyy')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatPrice(invoice.total)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={invoice.status === 'paid' ? 'default' : 'outline'} className={invoice.status === 'paid' ? 'bg-green-500' : ''}>
                      {invoice.status === 'paid' ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Pagado
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          Pendiente
                        </>
                      )}
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
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/reservas/${invoice.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver reserva
                          </Link>
                        </DropdownMenuItem>
                        {invoice.status !== 'paid' && (
                          <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice.id)}>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Marcar como pagado
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {invoicesData && invoicesData.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Página {page} de {invoicesData.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p - 1)}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= invoicesData.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AccountingPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  
  const { data: summary, isLoading: summaryLoading } = useFinancialSummary(selectedMonth);
  const { data: yearlyTotals } = useYearlyTotals();
  const { data: categoryData } = useRevenueByCategory();
  
  const handlePrevMonth = () => {
    setSelectedMonth(prev => subMonths(prev, 1));
  };
  
  const handleNextMonth = () => {
    const next = subMonths(selectedMonth, -1);
    if (next <= new Date()) {
      setSelectedMonth(next);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Contabilidad</h1>
          <p className="text-muted-foreground">
            Resumen financiero y facturación
          </p>
        </div>
        
        {/* Month selector */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="px-4 py-2 border rounded-lg min-w-[140px] text-center">
            <span className="font-medium capitalize">
              {format(selectedMonth, 'MMMM yyyy', { locale: es })}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleNextMonth}
            disabled={subMonths(selectedMonth, -1) > new Date()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Ingresos"
          value={formatPrice(summary?.revenue || 0)}
          change={summary?.revenueChange}
          changeLabel="vs mes anterior"
          icon={DollarSign}
          iconColor="bg-primary"
          trend={summary?.revenueChange && summary.revenueChange > 0 ? 'up' : summary?.revenueChange && summary.revenueChange < 0 ? 'down' : undefined}
          isLoading={summaryLoading}
        />
        
        <MetricCard
          title="Gastos"
          value={formatPrice(summary?.expenses || 0)}
          change={summary?.expensesChange}
          changeLabel="vs mes anterior"
          icon={CreditCard}
          iconColor="bg-orange-500"
          trend={summary?.expensesChange && summary.expensesChange > 0 ? 'up' : summary?.expensesChange && summary.expensesChange < 0 ? 'down' : undefined}
          isLoading={summaryLoading}
        />
        
        <MetricCard
          title="Beneficio"
          value={formatPrice(summary?.profit || 0)}
          change={summary?.profitMargin}
          changeLabel="margen"
          icon={TrendingUp}
          iconColor={summary?.profit && summary.profit >= 0 ? 'bg-green-500' : 'bg-destructive'}
          trend={summary?.profit && summary.profit >= 0 ? 'up' : 'down'}
          isLoading={summaryLoading}
        />
        
        <MetricCard
          title="Pendiente de cobro"
          value={formatPrice(summary?.pendingPayments || 0)}
          change={summary?.pendingPaymentsCount}
          changeLabel="reservas"
          icon={Clock}
          iconColor="bg-yellow-500"
          isLoading={summaryLoading}
        />
      </div>
      
      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Reservas del mes</p>
            <p className="text-2xl font-bold">{summary?.bookingsCount || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Ticket medio</p>
            <p className="text-2xl font-bold">{formatPrice(summary?.averageBookingValue || 0)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Ingresos {yearlyTotals?.year}</p>
            <p className="text-2xl font-bold">{formatPrice(yearlyTotals?.revenue || 0)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Beneficio {yearlyTotals?.year}</p>
            <p className="text-2xl font-bold">{formatPrice(yearlyTotals?.profit || 0)}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Evolución de ingresos</CardTitle>
            <CardDescription>Últimos 12 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>
        
        {/* Category Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ingresos por categoría</CardTitle>
            <CardDescription>Distribución este mes</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryChart />
            
            {/* Legend */}
            {categoryData && categoryData.length > 0 && (
              <div className="mt-4 space-y-2">
                {categoryData.map((item, index) => (
                  <div key={item.category} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span>{item.category}</span>
                    </div>
                    <span className="font-medium">{formatPrice(item.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Invoices/Payments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Facturación</CardTitle>
              <CardDescription>Reservas y pagos</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <InvoicesList />
        </CardContent>
      </Card>
    </div>
  );
}
