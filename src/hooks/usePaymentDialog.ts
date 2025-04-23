
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useInsertPayment } from "@/hooks/use-payments";
import { updateDownloadCount } from "@/utils/downloadManager";
import { useNavigate } from "react-router-dom";
import { downloadCvAsPdf } from "@/utils/download";

export const usePaymentDialog = (onClose: () => void, cvId?: string | null) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { mutate: insertPayment } = useInsertPayment();

  const handlePayment = async () => {
    if (!cvId) {
      toast({
        title: "Erreur",
        description: "Impossible d'identifier le CV à télécharger",
        variant: "destructive"
      });
      onClose();
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate verification delay for Wave payment
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      localStorage.removeItem('cv_being_paid');
      
      // Find the CV in localStorage
      const savedCVsJSON = localStorage.getItem("saved_cvs");
      if (savedCVsJSON) {
        const savedCVs = JSON.parse(savedCVsJSON);
        const cv = savedCVs.find((cv: any) => cv.id === cvId);
        
        if (cv) {
          // Generate a random download ID
          const downloadId = Math.random().toString(36).substring(2, 10).toUpperCase();
          // Trigger the download
          await downloadCvAsPdf(cv, downloadId);
        }
      }
      
      toast({
        title: "Téléchargement activé",
        description: "Votre paiement a été vérifié. Votre CV a été téléchargé automatiquement",
      });
      
      onClose();
      
      setTimeout(() => {
        setIsProcessing(false);
        navigate("/dashboard");
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
