import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  CreditCard,
  Banknote,
  RefreshCcw,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowDownLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useBookingPayments } from '@/hooks/usePayments';

interface PaymentHistoryProps {
  bookingId: string;
}

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  booking: 'Reserva',
  deposit: 'Fianza',
  extra: 'Extra',
  damage: 'Daños',
  refund: 'Reembolso',
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  pending: { label: 'Pendiente', icon: Clock, color: 'text-yellow-500' },
  processing: { label: 'Procesando', icon: RefreshCcw, color: 'text-blue-500' },
  succeeded: { label: 'Completado', icon: CheckCircle2, color: 'text-green-500' },
  failed: { label: 'Fallido', icon: XCircle, color: 'text-destructive' },
  refunded: { label: 'Reembolsado', icon: ArrowDownLeft, color: 'text-orange-500' },
};

const PAYMENT_METHOD_ICONS: Record<string, any> = {
  card: CreditCard,
  manual: Banknote,
  transfer: Banknote,
};

export function PaymentHistory({ bookingId }: PaymentHistoryProps) {
  const { data: payments, isLoading } = useBookingPayments(bookingId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No hay pagos registrados</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => {
        const statusConfig = PAYMENT_STATUS_CONFIG[payment.status];
        const StatusIcon = statusConfig?.icon || Clock;
        const MethodIcon = PAYMENT_METHOD_ICONS[payment.payment_method] || CreditCard;

        return (
          <div
            key={payment.id}
            className="flex items-center gap-4 p-3 border rounded-lg"
          >
            <div className={cn(
              'h-10 w-10 rounded-full flex items-center justify-center',
              payment.payment_type === 'refund' ? 'bg-orange-100' : 'bg-primary/10'
            )}>
              <MethodIcon className={cn(
                'h-5 w-5',
                payment.payment_type === 'refund' ? 'text-orange-500' : 'text-primary'
              )} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {PAYMENT_TYPE_LABELS[payment.payment_type] || payment.payment_type}
                </span>
                <Badge variant="outline" className="text-xs">
                  <StatusIcon className={cn('h-3 w-3 mr-1', statusConfig?.color)} />
                  {statusConfig?.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {format(parseISO(payment.created_at), "d MMM yyyy 'a las' HH:mm", { locale: es })}
              </p>
            </div>

            <div className={cn(
              'text-right font-semibold',
              payment.payment_type === 'refund' ? 'text-orange-500' : ''
            )}>
              {payment.payment_type === 'refund' ? '-' : ''}
              {formatPrice(payment.amount)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
