import { useState, useEffect } from 'react';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
  CreditCard,
  Loader2,
  Shield,
  Lock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCreatePaymentIntent, useMarkAsPaid } from '@/hooks/usePayments';

// Cargar Stripe
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

interface PaymentFormProps {
  bookingId: string;
  amount: number;
  customerEmail?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  showManualOption?: boolean;
}

// Componente interno con acceso a Stripe hooks
function CheckoutForm({
  bookingId,
  amount,
  customerEmail,
  onSuccess,
  onCancel,
  showManualOption,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'manual'>('card');

  const markAsPaidMutation = useMarkAsPaid();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);

    if (paymentMethod === 'manual') {
      // Pago manual (efectivo, transferencia, etc.)
      await markAsPaidMutation.mutateAsync({
        bookingId,
        paymentMethod: 'manual',
      });
      setPaymentSuccess(true);
      setTimeout(() => onSuccess?.(), 1500);
      return;
    }

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/admin/reservas/${bookingId}?payment=success`,
          receipt_email: customerEmail,
        },
        redirect: 'if_required',
      });

      if (error) {
        setPaymentError(error.message || 'Error al procesar el pago');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        await markAsPaidMutation.mutateAsync({
          bookingId,
          paymentMethod: 'card',
          paymentIntentId: paymentIntent.id,
        });
        setPaymentSuccess(true);
        setTimeout(() => onSuccess?.(), 1500);
      }
    } catch (err: any) {
      setPaymentError(err.message || 'Error inesperado');
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="text-center py-8">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">¡Pago completado!</h3>
        <p className="text-muted-foreground">
          El pago de {formatPrice(amount)} se ha procesado correctamente
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Selección de método */}
      {showManualOption && (
        <RadioGroup
          value={paymentMethod}
          onValueChange={(v) => setPaymentMethod(v as 'card' | 'manual')}
          className="grid grid-cols-2 gap-4"
        >
          <div>
            <RadioGroupItem value="card" id="card" className="peer sr-only" />
            <Label
              htmlFor="card"
              className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
            >
              <CreditCard className="mb-2 h-6 w-6" />
              <span className="font-medium">Tarjeta</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="manual" id="manual" className="peer sr-only" />
            <Label
              htmlFor="manual"
              className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
            >
              <Shield className="mb-2 h-6 w-6" />
              <span className="font-medium">Manual</span>
            </Label>
          </div>
        </RadioGroup>
      )}

      {/* Formulario de tarjeta */}
      {paymentMethod === 'card' && (
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-muted/30">
            <PaymentElement
              options={{
                layout: 'tabs',
              }}
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Pago seguro encriptado con SSL</span>
          </div>
        </div>
      )}

      {/* Pago manual */}
      {paymentMethod === 'manual' && (
        <Alert>
          <AlertDescription>
            <p className="font-medium mb-2">Pago manual</p>
            <p className="text-sm">
              Selecciona esta opción si el cliente ha pagado en efectivo,
              transferencia bancaria u otro método fuera de la plataforma.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Error */}
      {paymentError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{paymentError}</AlertDescription>
        </Alert>
      )}

      {/* Resumen */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="font-medium">Total a pagar</span>
          <span className="text-xl font-bold text-primary">{formatPrice(amount)}</span>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          disabled={(!stripe && paymentMethod === 'card') || isProcessing || markAsPaidMutation.isPending}
          className="flex-1"
        >
          {isProcessing || markAsPaidMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Pagar {formatPrice(amount)}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// Componente principal con provider de Stripe
export function PaymentForm(props: PaymentFormProps) {
  const createIntentMutation = useCreatePaymentIntent();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (props.bookingId && props.amount > 0 && stripePromise) {
      createIntentMutation.mutate(
        {
          bookingId: props.bookingId,
          amount: props.amount,
          paymentType: 'booking',
        },
        {
          onSuccess: (data) => {
            setClientSecret(data.client_secret);
          },
          onError: (err: any) => {
            setError(err.message || 'Error al inicializar el pago');
          },
        }
      );
    } else if (!stripePromise) {
      setError('Stripe no está configurado. Configura VITE_STRIPE_PUBLISHABLE_KEY en tu archivo .env');
    }
  }, [props.bookingId, props.amount]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!clientSecret || !stripePromise) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#0066CC',
        colorBackground: '#ffffff',
        colorText: '#1a1a1a',
        colorDanger: '#dc2626',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={stripeOptions}>
      <CheckoutForm {...props} />
    </Elements>
  );
}
