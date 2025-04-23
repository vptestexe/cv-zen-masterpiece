
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useInsertPayment } from "@/hooks/use-payments";
import { PAYMENT_AMOUNT } from "@/utils/downloadManager";

export const usePaymentDialog = (onClose: () => void) => {
  const { toast } = useToast();
  const { mutate: insertPayment } = useInsertPayment();
  const [isProcessing, setIsProcessing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [cvId, setCvId] = useState<string | null>(null);
  const [infoMissing, setInfoMissing] = useState(false);

  useEffect(() => {
    const storedCvId = localStorage.getItem('cv_being_paid');
    const storedUserId = localStorage.getItem('current_user_id');
    
    setCvId(storedCvId);
    setUserId(storedUserId);
    setInfoMissing(!storedCvId || !storedUserId);
  }, []);

  const handlePayment = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!cvId || !userId) {
      toast({
        title: "Erreur",
        description: "Informations manquantes pour le paiement",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const orderRef = `cv-${cvId.substring(0,8)}`;
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/dashboard?payment_status=success`;
      const cancelUrl = `${baseUrl}/dashboard?payment_status=cancel`;
      
      const rayCashUrl = `https://pay.raycash.com/checkout?`
        + `amount=${PAYMENT_AMOUNT}`
        + `&reference=${orderRef}`
        + `&description=${encodeURIComponent(`Téléchargement de CV - ${orderRef}`)}`
        + `&return_url=${encodeURIComponent(successUrl)}`
        + `&cancel_url=${encodeURIComponent(cancelUrl)}`;
      
      localStorage.setItem('payment_attempt', JSON.stringify({
        cvId,
        userId,
        timestamp: Date.now(),
        amount: PAYMENT_AMOUNT,
        orderRef
      }));
      
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

  const handleTestPayment = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!cvId || !userId) {
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
        userId,
        cvId,
        amount: PAYMENT_AMOUNT,
      });
      
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
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    infoMissing,
    handlePayment,
    handleTestPayment
  };
};
