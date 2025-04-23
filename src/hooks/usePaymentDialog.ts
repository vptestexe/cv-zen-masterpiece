
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const usePaymentDialog = (onClose: () => void) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [cvId, setCvId] = useState<string | null>(null);

  const handlePayment = async () => {
    try {
      localStorage.removeItem('cv_being_paid');
      onClose();
      
      toast({
        title: "Téléchargement activé",
        description: "Vous pouvez maintenant télécharger votre CV",
      });
      
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
    }
  };

  return {
    isProcessing,
    handlePayment
  };
};
