import { useState } from 'react';
import {
  ArrowDownLeft,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useProcessRefund } from '@/hooks/usePayments';

interface RefundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentIntentId: string;
  maxAmount: number;
  onSuccess?: () => void;
}

export function RefundDialog({
  open,
  onOpenChange,
  paymentIntentId,
  maxAmount,
  onSuccess,
}: RefundDialogProps) {
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [amount, setAmount] = useState(maxAmount);
  const [reason, setReason] = useState('');

  const refundMutation = useProcessRefund();

  const handleSubmit = async () => {
    await refundMutation.mutateAsync({
      paymentIntentId,
      amount: refundType === 'partial' ? amount : undefined,
      reason: reason || undefined,
    });
    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-500">
            <ArrowDownLeft className="h-5 w-5" />
            Procesar reembolso
          </DialogTitle>
          <DialogDescription>
            Máximo reembolsable: {formatPrice(maxAmount)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Esta acción no se puede deshacer. El reembolso se procesará a través de Stripe
              y puede tardar 5-10 días en reflejarse en la cuenta del cliente.
            </AlertDescription>
          </Alert>

          <RadioGroup
            value={refundType}
            onValueChange={(v) => {
              setRefundType(v as 'full' | 'partial');
              if (v === 'full') setAmount(maxAmount);
            }}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="full" id="full" />
              <Label htmlFor="full">Reembolso total ({formatPrice(maxAmount)})</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="partial" id="partial" />
              <Label htmlFor="partial">Reembolso parcial</Label>
            </div>
          </RadioGroup>

          {refundType === 'partial' && (
            <div className="space-y-2">
              <Label htmlFor="amount">Importe a reembolsar (€)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min={0.5}
                max={maxAmount}
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo del reembolso</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Opcional: indica el motivo..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={
              refundMutation.isPending ||
              (refundType === 'partial' && (amount <= 0 || amount > maxAmount))
            }
          >
            {refundMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <ArrowDownLeft className="h-4 w-4 mr-2" />
                Reembolsar {formatPrice(refundType === 'partial' ? amount : maxAmount)}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
