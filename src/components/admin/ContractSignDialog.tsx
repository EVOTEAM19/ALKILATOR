import { useState } from 'react';
import {
  FileSignature,
  Loader2,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SignatureCanvas } from './SignatureCanvas';
import { useSaveSignedContract } from '@/hooks/useContract';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ContractSignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  bookingNumber: string;
  customerName: string;
  onSigned?: () => void;
}

export function ContractSignDialog({
  open,
  onOpenChange,
  bookingId,
  bookingNumber,
  customerName,
  onSigned,
}: ContractSignDialogProps) {
  const [step, setStep] = useState<'info' | 'sign' | 'complete'>('info');
  const saveMutation = useSaveSignedContract();
  
  const handleSaveSignature = async (signatureData: string) => {
    await saveMutation.mutateAsync({
      bookingId,
      signatureData,
    });
    setStep('complete');
    setTimeout(() => {
      onOpenChange(false);
      setStep('info');
      onSigned?.();
    }, 2000);
  };
  
  return (
    <Dialog open={open} onOpenChange={(o) => {
      if (!o) setStep('info');
      onOpenChange(o);
    }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-primary" />
            Firma del contrato
          </DialogTitle>
          <DialogDescription>
            Reserva {bookingNumber} - {customerName}
          </DialogDescription>
        </DialogHeader>
        
        {step === 'info' && (
          <div className="space-y-4 py-4">
            <Alert>
              <AlertDescription>
                Al firmar este contrato, el cliente acepta las condiciones generales del alquiler.
                Asegúrese de que el cliente ha leído y comprendido todas las cláusulas.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2 text-sm">
              <p><strong>Importante:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Verificar la identidad del cliente (DNI/Pasaporte)</li>
                <li>Comprobar el carnet de conducir vigente</li>
                <li>Confirmar el método de pago para la fianza</li>
                <li>Revisar el estado del vehículo con el cliente</li>
              </ul>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => setStep('sign')}>
                Continuar a la firma
              </Button>
            </div>
          </div>
        )}
        
        {step === 'sign' && (
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              El cliente debe firmar en el recuadro inferior:
            </p>
            <SignatureCanvas
              onSave={handleSaveSignature}
              onCancel={() => setStep('info')}
            />
            {saveMutation.isPending && (
              <div className="flex items-center justify-center mt-4">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Guardando firma...</span>
              </div>
            )}
          </div>
        )}
        
        {step === 'complete' && (
          <div className="py-8 text-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Contrato firmado</h3>
            <p className="text-muted-foreground">
              La firma ha sido guardada correctamente
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
