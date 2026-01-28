import {
  CreditCard,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PaymentForm } from './PaymentForm';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  bookingNumber: string;
  amount: number;
  customerEmail?: string;
  onSuccess?: () => void;
}

export function PaymentDialog({
  open,
  onOpenChange,
  bookingId,
  bookingNumber,
  amount,
  customerEmail,
  onSuccess,
}: PaymentDialogProps) {
  const handleSuccess = () => {
    onSuccess?.();
    setTimeout(() => onOpenChange(false), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Procesar pago
          </DialogTitle>
          <DialogDescription>
            Reserva {bookingNumber} - {formatPrice(amount)}
          </DialogDescription>
        </DialogHeader>

        <PaymentForm
          bookingId={bookingId}
          amount={amount}
          customerEmail={customerEmail}
          onSuccess={handleSuccess}
          onCancel={() => onOpenChange(false)}
          showManualOption={true}
        />
      </DialogContent>
    </Dialog>
  );
}
