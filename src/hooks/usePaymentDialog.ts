
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useInsertPayment } from "@/hooks/use-payments";
import { useNavigate } from "react-router-dom";

export const usePaymentDialog = (onClose: () => void) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { mutate: insertPayment } = useInsertPayment();

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate verification delay for Wave payment
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      localStorage.removeItem('cv_being_paid');
      onClose();
      
      toast({
        title: "Téléchargement activé",
        description: "Votre paiement a été vérifié. Vous pouvez maintenant télécharger votre CV",
      });
      
      setTimeout(() => {
        setIsProcessing(false);
        window.location.href = "/dashboard";
      }, 500);
    } catch (error) {
      console.error("Erreur lors de l'activation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de vérifier le paiement. Veuillez réessayer.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handlePayment
  };
};
