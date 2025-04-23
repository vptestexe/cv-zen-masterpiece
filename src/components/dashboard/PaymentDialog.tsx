
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { usePaymentDialog } from "@/hooks/usePaymentDialog";
import PaymentButtons from "./PaymentButtons";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { PAID_DOWNLOADS_PER_CV } from "@/utils/downloads/types";

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  cvId?: string | null;
}

const PaymentDialog = ({ open, onClose, cvId }: PaymentDialogProps) => {
  const { handlePayment, isProcessing } = usePaymentDialog(onClose, cvId);

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
              `Cliquez sur le bouton ci-dessous pour obtenir ${PAID_DOWNLOADS_PER_CV} téléchargements pour votre CV.`
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          {isProcessing ? (
            <Skeleton className="w-full h-10" />
          ) : (
            <button
              onClick={handlePayment}
              className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
              type="button"
              disabled={isProcessing}
            >
              Télécharger gratuitement
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
