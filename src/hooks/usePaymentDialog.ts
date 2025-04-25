
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useInsertPayment } from "@/hooks/use-payments";
import { updateDownloadCount } from "@/utils/downloadManager";
import { useNavigate } from "react-router-dom";
import { downloadCvAsPdf } from "@/utils/download";
import { supabase } from "@/integrations/supabase/client";
import { PAYMENT_AMOUNT } from "@/utils/downloads/types";

export type VerificationStatus = 'idle' | 'processing' | 'success' | 'error';

export const usePaymentDialog = (onClose: () => void, cvId?: string | null) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
  const navigate = useNavigate();
  const { mutate: insertPayment } = useInsertPayment();

  useEffect(() => {
    const handlePaymentCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const status = urlParams.get('status');
      const transactionId = urlParams.get('transaction_id');
      const cvBeingPaid = localStorage.getItem('cv_being_paid');
      
      if (!status || !cvBeingPaid) {
        console.log("Pas de statut ou de CV en cours de paiement:", { status, cvBeingPaid });
        return;
      }
      
      console.log("Vérification du paiement:", { status, transactionId, cvBeingPaid });
      
      setIsProcessing(true);
      setVerificationStatus('processing');
      
      try {
        if (status === 'success' && transactionId) {
          const userId = localStorage.getItem('current_user_id');
          if (!userId) {
            console.error("User ID non trouvé");
            throw new Error('User ID non trouvé');
          }
          
          console.log("Vérification avec la base de données pour:", { userId, cvBeingPaid, amount: PAYMENT_AMOUNT });

          // Verify with database
          const { data, error } = await supabase.rpc('verify_payment', {
            p_user_id: userId,
            p_cv_id: cvBeingPaid,
            p_amount: PAYMENT_AMOUNT,
            p_transaction_id: transactionId
          });

          if (error) {
            console.error("Erreur lors de la vérification RPC:", error);
            throw error;
          }
          
          console.log("Vérification réussie:", data);

          // Update download count
          const updatedCount = updateDownloadCount(cvBeingPaid, true);
          console.log("Nombre de téléchargements mis à jour:", updatedCount);
          
          // Clean up
          localStorage.removeItem('cv_being_paid');
          
          // Update UI
          setVerificationStatus('success');
          
          // Start download
          const savedCVsJSON = localStorage.getItem("saved_cvs");
          if (savedCVsJSON) {
            const savedCVs = JSON.parse(savedCVsJSON);
            const cv = savedCVs.find((cv: any) => cv.id === cvBeingPaid);
            
            if (cv) {
              const downloadId = Math.random().toString(36).substring(2, 10).toUpperCase();
              console.log("Démarrage du téléchargement avec ID:", downloadId);
              setTimeout(() => downloadCvAsPdf(cv, downloadId), 1000);
            } else {
              console.error("CV non trouvé dans saved_cvs");
            }
          } else {
            console.error("Aucun CV sauvegardé trouvé");
          }
          
          // Clean URL
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
          
          // Show success message
          toast({
            title: "Paiement réussi",
            description: "Votre paiement a été confirmé. Le téléchargement va démarrer.",
          });
          
          // Close dialog after download starts
          setTimeout(() => {
            setIsProcessing(false);
            onClose();
            navigate("/dashboard", { replace: true });
          }, 2500);
        } else if (status === 'cancelled') {
          console.log("Paiement annulé par l'utilisateur");
          throw new Error("Paiement annulé");
        } else {
          console.error("Statut de paiement invalide:", status);
          throw new Error("Statut de paiement invalide");
        }
      } catch (error) {
        console.error("Erreur de vérification du paiement:", error);
        setVerificationStatus('error');
        setIsProcessing(false);
        
        // Clean URL to prevent repeated error state
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        
        // Clean localStorage
        localStorage.removeItem('cv_being_paid');
        
        toast({
          title: "Échec de la vérification",
          description: error instanceof Error ? error.message : "Une erreur est survenue",
          variant: "destructive"
        });
      }
    };

    // Add a small timeout to ensure everything is loaded
    const timeoutId = setTimeout(() => {
      handlePaymentCallback();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [navigate, onClose, toast, insertPayment]);

  return {
    isProcessing,
    verificationStatus,
    handleVerifyPayment: () => {
      setIsProcessing(true);
      setVerificationStatus('processing');
    }
  };
};
