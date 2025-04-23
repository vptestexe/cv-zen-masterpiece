
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PAYMENT_AMOUNT } from "@/utils/downloadManager";
import { usePaymentDialog } from "@/hooks/usePaymentDialog";
import PaymentButtons from "./PaymentButtons";

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
}

const PaymentDialog = ({ open, onClose }: PaymentDialogProps) => {
  const { isProcessing, infoMissing, handlePayment, handleTestPayment } = usePaymentDialog(onClose);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Paiement pour téléchargement</DialogTitle>
          <DialogDescription>
            Payez {PAYMENT_AMOUNT} F CFA via RayCash/PayLink pour activer le téléchargement de votre CV.
            {infoMissing && (
              <div className="mt-2 text-red-500 text-sm">
                Attention: Informations utilisateur ou CV manquantes. Veuillez retourner au dashboard et réessayer.
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <PaymentButtons
            infoMissing={infoMissing}
            isProcessing={isProcessing}
            onClose={onClose}
            onPayment={handlePayment}
            onTestPayment={handleTestPayment}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
