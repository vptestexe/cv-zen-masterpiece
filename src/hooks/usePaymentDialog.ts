
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
    setVerificationStatus('processing');
    
    try {
      // Get current user ID from localStorage
      const userId = localStorage.getItem('current_user_id');
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      // Add a delay to simulate payment verification
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check for Wave payment return parameters in URL first
      const urlParams = new URLSearchParams(window.location.search);
      const waveSuccess = urlParams.get('wave_success');
      const waveOrderRef = urlParams.get('order_ref');
      
      let paymentVerified = false;
      
      // If Wave success parameter is present in URL, consider it a successful payment
      if (waveSuccess === 'true' && cvId === localStorage.getItem('cv_being_paid')) {
        paymentVerified = true;
        console.log("Wave payment verified via URL parameters");
        
        // Clean URL parameters
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      } else {
        // Attempt to verify the payment with Supabase
        const { data, error } = await supabase.rpc('verify_payment', {
          p_user_id: userId,
          p_cv_id: cvId,
          p_amount: 1000,
          p_transaction_id: `WAVE_${Date.now()}`
        });
        
        if (error) {
          console.error("Payment verification error:", error);
          throw error;
        }
        
        paymentVerified = !!data;
        console.log("Payment verification result:", data);
      }
      
      if (paymentVerified) {
        // Update local download count
        updateDownloadCount(cvId, true);
        
        // Clear payment tracking
        localStorage.removeItem('cv_being_paid');
        
        setVerificationStatus('success');
        
        // Find the CV in localStorage
        const savedCVsJSON = localStorage.getItem("saved_cvs");
        if (savedCVsJSON) {
          const savedCVs = JSON.parse(savedCVsJSON);
          const cv = savedCVs.find((cv: any) => cv.id === cvId);
          
          if (cv) {
            // Generate a random download ID
            const downloadId = Math.random().toString(36).substring(2, 10).toUpperCase();
            
            // Short delay before download to ensure the success message is displayed
            setTimeout(async () => {
              // Trigger the download
              await downloadCvAsPdf(cv, downloadId);
              
              // Close the dialog after download starts
              setTimeout(() => {
                setIsProcessing(false);
                onClose();
                navigate("/dashboard");
              }, 1500);
            }, 1000);
          }
        }
      } else {
        throw new Error("Payment not verified");
      }
    } catch (error) {
      console.error("Error during payment verification:", error);
      setVerificationStatus('error');
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    verificationStatus,
    handlePayment
  };
};
