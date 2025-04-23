
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
      const cvBeingPaid = localStorage.getItem('cv_being_paid');
      if (!cvBeingPaid || state.processingPayment || !userId) return;

      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment_status');
      const paymentAttemptJson = localStorage.getItem('payment_attempt');
      const paymentAttempt = paymentAttemptJson ? JSON.parse(paymentAttemptJson) : null;
      
      // Check for Wave return URL parameters
      const waveSuccess = urlParams.get('wave_success');
      const waveOrderRef = urlParams.get('order_ref');
      
      if ((paymentStatus === 'success' || waveSuccess === 'true') && 
          (paymentAttempt?.cvId === cvBeingPaid || cvBeingPaid)) {
            
        state.setProcessingPayment(true);
        
        try {
          console.log("Verifying payment for CV:", cvBeingPaid);
          
          // Add a 3 second delay for payment verification
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Use RPC function to verify payment in database
          const { data, error } = await supabase.rpc('verify_payment', {
            p_user_id: userId,
            p_cv_id: cvBeingPaid,
            p_amount: 1000,
            p_transaction_id: waveOrderRef || `WAVE_${Date.now()}`
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
          
          localStorage.removeItem('cv_being_paid');
          localStorage.removeItem('payment_attempt');
          
          // Clean URL parameters
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
          
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
            title: "Erreur enregistrement paiement",
            description: "Impossible de vérifier le paiement dans la base de données",
            variant: "destructive"
          });
        }
      } else if (paymentStatus === 'cancel' || urlParams.get('wave_cancel') === 'true') {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        
        toast({
          title: "Paiement annulé",
          description: "Vous avez annulé le processus de paiement",
          variant: "default"
        });
      }
    };
    
    verifyPayment();
  }, [state.processingPayment, userId, toast, insertPayment]);
};
