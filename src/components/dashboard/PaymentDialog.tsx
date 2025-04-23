
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
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
  const [userId, setUserId] = useState<string | null>(null);
  const [cvId, setCvId] = useState<string | null>(null);

  // Récupérer les informations nécessaires lors de l'ouverture du dialogue
  useEffect(() => {
    if (open) {
      const storedCvId = localStorage.getItem('cv_being_paid');
      const storedUserId = localStorage.getItem('current_user_id');
      
      setCvId(storedCvId);
      setUserId(storedUserId);
      
      // Afficher des logs pour le débogage
      console.log("Dialog opened with:", { 
        cvId: storedCvId, 
        userId: storedUserId 
      });
    }
  }, [open]);

  const handleConfirm = async () => {
    // Vérifier de nouveau les informations au moment de la confirmation
    const currentCvId = cvId || localStorage.getItem('cv_being_paid');
    const currentUserId = userId || localStorage.getItem('current_user_id');
    
    console.log("Confirming with:", { cvId: currentCvId, userId: currentUserId });
    
    if (!currentCvId || !currentUserId) {
      toast({
        title: "Erreur",
        description: "Informations manquantes pour le téléchargement",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      await insertPayment({
        userId: currentUserId,
        cvId: currentCvId,
        amount: 0,
      });
      
      localStorage.removeItem('cv_being_paid');
      onClose();
      
      toast({
        title: "Téléchargement activé",
        description: "Vous pouvez maintenant télécharger votre CV",
      });
      
      // Recharger la page pour mettre à jour l'état des téléchargements
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
            {(!cvId || !userId) && (
              <div className="mt-2 text-red-500 text-sm">
                Attention: Informations utilisateur ou CV manquantes. Veuillez retourner au dashboard et réessayer.
              </div>
            )}
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
