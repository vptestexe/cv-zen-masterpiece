
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { usePaymentDialog } from "@/hooks/usePaymentDialog";
import PaymentButtons from "./PaymentButtons";

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
}

const PaymentDialog = ({ open, onClose }: PaymentDialogProps) => {
  const { handlePayment } = usePaymentDialog(onClose);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Téléchargement de CV</DialogTitle>
          <DialogDescription>
            Cliquez sur le bouton ci-dessous pour télécharger votre CV.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <button
            onClick={handlePayment}
            className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
            type="button"
          >
            Télécharger gratuitement
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
