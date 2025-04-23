
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useInsertPayment } from "@/hooks/use-payments";
import { updateDownloadCount } from "@/utils/downloadManager";
import { PAID_DOWNLOADS_PER_CV } from "@/utils/downloads/types";
import { supabase } from "@/integrations/supabase/client";

export const usePaymentVerification = (
  state: any,
  userId: string | undefined
) => {
  const { toast } = useToast();
  const { mutate: insertPayment } = useInsertPayment();

  useEffect(() => {
    const verifyPayment = async () => {
      // Get URLs parameters
      const urlParams = new URLSearchParams(window.location.search);
      const waveSuccess = urlParams.get('wave_success');
      const waveOrderRef = urlParams.get('order_ref');
      
      // Check if there's a CV being paid and we have success parameters
      const cvBeingPaid = localStorage.getItem('cv_being_paid');
      const paymentAttemptJson = localStorage.getItem('payment_attempt');
      
      // Only proceed if we have all required information
      if (!cvBeingPaid || !userId || state.processingPayment || 
          !waveSuccess || waveSuccess !== 'true' || !waveOrderRef) {
        return;
      }
      
      try {
        // Mark as processing to prevent duplicate verifications
        state.setProcessingPayment(true);
        
        console.log("Verifying Wave payment for CV:", cvBeingPaid, "with order reference:", waveOrderRef);
        
        const paymentAttempt = paymentAttemptJson ? JSON.parse(paymentAttemptJson) : null;
        
        // Validate that this payment attempt matches our stored attempt
        if (!paymentAttempt || paymentAttempt.cvId !== cvBeingPaid) {
          console.error("Payment attempt mismatch", { 
            stored: paymentAttempt?.cvId, 
            current: cvBeingPaid 
          });
          throw new Error("Payment verification failed: Invalid payment attempt");
        }
        
        // Add a short delay for payment verification to mimic server processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Use RPC function to verify payment in database
        const { data, error } = await supabase.rpc('verify_payment', {
          p_user_id: userId,
          p_cv_id: cvBeingPaid,
          p_amount: 1000,
          p_transaction_id: waveOrderRef
        });
        
        if (error) {
          throw error;
        }
        
        // Update local download count
        const updatedCount = updateDownloadCount(cvBeingPaid, true);
        state.setDownloadCounts((prev: any) => ({
          ...prev,
          [cvBeingPaid]: updatedCount
        }));
        
        // Clean URL parameters and local storage
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        
        localStorage.removeItem('cv_being_paid');
        localStorage.removeItem('payment_attempt');
        
        state.setProcessingPayment(false);
        
        toast({
          title: "Paiement confirmé",
          description: `La vérification est terminée. Vous disposez maintenant de ${PAID_DOWNLOADS_PER_CV} téléchargements pour ce CV.`,
        });
        
        // Open payment dialog to show success and download options
        state.setCurrentCvId(cvBeingPaid);
        state.setShowPaymentDialog(true);
      } catch (error) {
        console.error("Payment verification error:", error);
        state.setProcessingPayment(false);
        toast({
          title: "Erreur de vérification",
          description: "Impossible de vérifier le paiement. Veuillez réessayer.",
          variant: "destructive"
        });
        
        // Reset the payment attempt state
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    };
    
    verifyPayment();
  }, [state, userId, toast, insertPayment]);
};
