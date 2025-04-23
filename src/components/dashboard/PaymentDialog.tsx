
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useInsertPayment } from "@/hooks/use-payments";

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
}

const PaymentDialog = ({ open, onClose }: PaymentDialogProps) => {
  const { toast } = useToast();
  const { mutate: insertPayment } = useInsertPayment();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    const cvId = localStorage.getItem('cv_being_paid');
    const userId = localStorage.getItem('current_user_id');
    
    if (!cvId || !userId) {
      toast({
        title: "Erreur",
        description: "Informations manquantes",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      await insertPayment({
        userId,
        cvId,
        amount: 0,
      });
      
      localStorage.removeItem('cv_being_paid');
      onClose();
      
      toast({
        title: "Téléchargement activé",
        description: "Vous pouvez maintenant télécharger votre CV",
      });
      
      window.location.reload();
    } catch (error) {
      console.error("Erreur lors de l'activation:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'activer le téléchargement",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Activer le téléchargement</DialogTitle>
          <DialogDescription>
            Cliquez sur le bouton ci-dessous pour activer le téléchargement de votre CV.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
          >
            {isProcessing ? "Activation..." : "Activer le téléchargement"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
