
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useInsertPayment } from "@/hooks/use-payments";
import { updateDownloadCount } from "@/utils/downloadManager";
import { useNavigate } from "react-router-dom";
import { downloadCvAsPdf } from "@/utils/download";
import { supabase } from "@/integrations/supabase/client";

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
      
      if (!status || !cvBeingPaid) return;
      
      setIsProcessing(true);
      setVerificationStatus('processing');
      
      try {
        if (status === 'success' && transactionId) {
          const userId = localStorage.getItem('current_user_id');
          if (!userId) throw new Error('User ID not found');

          // Verify with database
          const { error } = await supabase.rpc('verify_payment', {
            p_user_id: userId,
            p_cv_id: cvBeingPaid,
            p_amount: 1000,
            p_transaction_id: transactionId
          });

          if (error) throw error;

          // Update download count
          updateDownloadCount(cvBeingPaid, true);
          
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
              setTimeout(() => downloadCvAsPdf(cv, downloadId), 1000);
            }
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
            navigate("/dashboard");
          }, 2500);
        } else if (status === 'cancelled') {
          throw new Error("Paiement annulé");
        } else {
          throw new Error("Statut de paiement invalide");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setVerificationStatus('error');
        setIsProcessing(false);
        
        toast({
          title: "Échec de la vérification",
          description: error instanceof Error ? error.message : "Une erreur est survenue",
          variant: "destructive"
        });
      }
    };

    handlePaymentCallback();
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
