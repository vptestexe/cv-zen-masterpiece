
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useInsertPayment } from "@/hooks/use-payments";
import { updateDownloadCount } from "@/utils/downloadManager";

export const usePaymentVerification = (
  state: any,
  userId: string | undefined
) => {
  const { toast } = useToast();
  const { mutate: insertPayment } = useInsertPayment();

  useEffect(() => {
    const verifyPayment = async () => {
      const cvBeingPaid = localStorage.getItem('cv_being_paid');
      if (!cvBeingPaid || state.processingPayment) return;

      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment_status');
      const paymentAttemptJson = localStorage.getItem('payment_attempt');
      const paymentAttempt = paymentAttemptJson ? JSON.parse(paymentAttemptJson) : null;
      
      if (paymentStatus === 'success' && paymentAttempt && 
          paymentAttempt.cvId === cvBeingPaid && 
          paymentAttempt.userId === userId) {
            
        state.setProcessingPayment(true);
        
        try {
          await insertPayment({
            userId: userId,
            cvId: cvBeingPaid,
            amount: 0, // Free downloads
            transactionId: paymentAttempt.orderRef || null,
          });
          
          const updatedCount = updateDownloadCount(cvBeingPaid, true);
          state.setDownloadCounts((prev: any) => ({
            ...prev,
            [cvBeingPaid]: updatedCount
          }));
          
          localStorage.removeItem('cv_being_paid');
          localStorage.removeItem('payment_attempt');
          
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
          
          state.setProcessingPayment(false);
          
          toast({
            title: "Paiement confirmé",
            description: "Vous disposez maintenant de 5 téléchargements pour ce CV.",
          });
        } catch (error) {
          console.error("Payment verification error:", error);
          state.setProcessingPayment(false);
          toast({
            title: "Erreur enregistrement paiement",
            description: "Impossible d'enregistrer le paiement en base",
            variant: "destructive"
          });
        }
      } else if (paymentStatus === 'cancel') {
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
