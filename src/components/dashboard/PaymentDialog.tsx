
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useInsertPayment } from "@/hooks/use-payments";
import { PAYMENT_AMOUNT } from "@/utils/downloadManager";

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
  const [infoMissing, setInfoMissing] = useState(false);
  
  const form = useForm({
    defaultValues: {
      email: "",
      fullName: "",
    }
  });

  // Récupérer les informations nécessaires lors de l'ouverture du dialogue
  useEffect(() => {
    if (open) {
      const storedCvId = localStorage.getItem('cv_being_paid');
      const storedUserId = localStorage.getItem('current_user_id');
      
      setCvId(storedCvId);
      setUserId(storedUserId);
      setInfoMissing(!storedCvId || !storedUserId);
      
      // Afficher des logs pour le débogage
      console.log("Dialog opened with:", { 
        cvId: storedCvId, 
        userId: storedUserId 
      });
    }
  }, [open]);

  const handleRayCashPayment = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const currentCvId = cvId || localStorage.getItem('cv_being_paid');
    const currentUserId = userId || localStorage.getItem('current_user_id');
    
    console.log("Redirecting to RayCash with:", { cvId: currentCvId, userId: currentUserId });
    
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
      // Créer l'URL de paiement RayCash/PayLink avec les bons URLs de callback
      const orderRef = `cv-${currentCvId.substring(0,8)}`;
      const paymentDescription = `Téléchargement de CV - ${orderRef}`;
      
      // URL de base de l'application
      const baseUrl = window.location.origin;
      
      // URLs de callback pour RayCash/PayLink
      const successUrl = `${baseUrl}/dashboard?payment_status=success`;
      const cancelUrl = `${baseUrl}/dashboard?payment_status=cancel`;
      
      // Construction de l'URL RayCash/PayLink
      const rayCashUrl = `https://pay.raycash.com/checkout?`
        + `amount=${PAYMENT_AMOUNT}`
        + `&reference=${orderRef}`
        + `&description=${encodeURIComponent(paymentDescription)}`
        + `&return_url=${encodeURIComponent(successUrl)}`
        + `&cancel_url=${encodeURIComponent(cancelUrl)}`;
      
      // Stocker les informations de la tentative de paiement
      const paymentAttempt = {
        cvId: currentCvId,
        userId: currentUserId,
        timestamp: Date.now(),
        amount: PAYMENT_AMOUNT,
        orderRef
      };
      localStorage.setItem('payment_attempt', JSON.stringify(paymentAttempt));
      
      // Rediriger vers la page de paiement
      window.location.href = rayCashUrl;
    } catch (error) {
      console.error("Erreur lors de la préparation du paiement:", error);
      toast({
        title: "Erreur",
        description: "Impossible de préparer le paiement",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  const handleTestSuccess = async (e: React.MouseEvent) => {
    // Prévenir le comportement par défaut pour éviter le rechargement de page
    e.preventDefault();
    
    // Vérifier de nouveau les informations au moment de la confirmation
    const currentCvId = cvId || localStorage.getItem('cv_being_paid');
    const currentUserId = userId || localStorage.getItem('current_user_id');
    
    console.log("Testing success with:", { cvId: currentCvId, userId: currentUserId });
    
    if (!currentCvId || !currentUserId) {
      toast({
        title: "Erreur",
        description: "Informations manquantes pour le test",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      await insertPayment({
        userId: currentUserId,
        cvId: currentCvId,
        amount: PAYMENT_AMOUNT,
      });
      
      localStorage.removeItem('cv_being_paid');
      onClose();
      
      toast({
        title: "Téléchargement activé",
        description: "Vous pouvez maintenant télécharger votre CV",
      });
      
      // Utiliser une fonction timeout pour éviter les problèmes de timing
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    } catch (error) {
      console.error("Erreur lors de l'activation:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'activer le téléchargement",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

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
          {infoMissing ? (
            <button
              onClick={onClose}
              className="py-2 px-4 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors font-medium"
              type="button"
            >
              Retourner au dashboard
            </button>
          ) : (
            <>
              <button
                onClick={handleRayCashPayment}
                disabled={isProcessing || infoMissing}
                className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                type="button"
              >
                {isProcessing ? "Traitement en cours..." : "Payer avec RayCash/PayLink"}
              </button>
              
              {/* Bouton de test - À supprimer en production */}
              <button
                onClick={handleTestSuccess}
                disabled={isProcessing || infoMissing}
                className="mt-2 py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 text-sm"
                type="button"
              >
                Test: Simuler un paiement réussi
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
