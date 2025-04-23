
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { usePaymentDialog } from "@/hooks/usePaymentDialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { PAID_DOWNLOADS_PER_CV, PAYMENT_AMOUNT } from "@/utils/downloads/types";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  cvId?: string | null;
}

const PaymentDialog = ({ open, onClose, cvId }: PaymentDialogProps) => {
  const { handlePayment, isProcessing } = usePaymentDialog(onClose, cvId);
  const isMobile = useIsMobile();
  const WAVE_PAYMENT_URL = "https://pay.wave.com/m/M_ci_C5jSUwlXR3P5/c/ci/?amount=1000";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Téléchargement de CV</DialogTitle>
          <DialogDescription>
            {isProcessing ? (
              <div className="space-y-4">
                <p>Vérification du paiement en cours...</p>
                <Progress value={100} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  Veuillez patienter pendant la vérification de votre paiement.
                  Cette opération peut prendre jusqu'à 5 secondes.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p>
                  Pour obtenir {PAID_DOWNLOADS_PER_CV} téléchargements, veuillez effectuer un paiement de {PAYMENT_AMOUNT} FCFA via Wave.
                </p>
                {!isMobile ? (
                  <div className="flex flex-col items-center space-y-4">
                    <img 
                      src="/lovable-uploads/1c070811-a6f0-4e04-be67-11bc4226d5f9.png" 
                      alt="Code QR Wave" 
                      className="w-64 h-64 object-contain"
                    />
                    <p className="text-sm text-muted-foreground">
                      Scannez le code QR avec l'application Wave
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-4">
                    <Button 
                      className="w-full bg-[#00b6f0] hover:bg-[#00a0d6]"
                      onClick={() => window.location.href = WAVE_PAYMENT_URL}
                    >
                      Payer avec Wave
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
