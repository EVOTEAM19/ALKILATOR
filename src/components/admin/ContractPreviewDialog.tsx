import { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Loader2,
  ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useContractPreview, useDownloadContract, useDownloadChecklist } from '@/hooks/useContract';

interface ContractPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  bookingNumber: string;
}

export function ContractPreviewDialog({
  open,
  onOpenChange,
  bookingId,
  bookingNumber,
}: ContractPreviewDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const previewMutation = useContractPreview();
  const downloadMutation = useDownloadContract();
  const checklistMutation = useDownloadChecklist();
  
  useEffect(() => {
    if (open && bookingId) {
      previewMutation.mutate(bookingId, {
        onSuccess: (url) => {
          setPreviewUrl(url);
        },
      });
    }
    
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    };
  }, [open, bookingId]);
  
  const handleDownload = () => {
    downloadMutation.mutate({ 
      bookingId, 
      filename: `contrato_${bookingNumber}.pdf` 
    });
  };
  
  const handlePrint = () => {
    if (previewUrl) {
      const printWindow = window.open(previewUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };
  
  const handleDownloadChecklist = () => {
    checklistMutation.mutate(bookingId);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Contrato de alquiler
              </DialogTitle>
              <DialogDescription>
                Reserva {bookingNumber}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadChecklist}
                disabled={checklistMutation.isPending}
              >
                {checklistMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <ClipboardList className="h-4 w-4 mr-1" />
                    Checklist
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                disabled={!previewUrl}
              >
                <Printer className="h-4 w-4 mr-1" />
                Imprimir
              </Button>
              <Button
                size="sm"
                onClick={handleDownload}
                disabled={downloadMutation.isPending}
              >
                {downloadMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-1" />
                    Descargar PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="p-4 pt-2">
          <div className="border rounded-lg bg-muted/50 overflow-hidden" style={{ height: '70vh' }}>
            {previewMutation.isPending ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                  <p className="text-muted-foreground">Generando contrato...</p>
                </div>
              </div>
            ) : previewMutation.isError ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">Error al generar el contrato</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => previewMutation.mutate(bookingId)}
                  >
                    Reintentar
                  </Button>
                </div>
              </div>
            ) : previewUrl ? (
              <iframe
                src={previewUrl}
                className="w-full h-full"
                title="Vista previa del contrato"
              />
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
