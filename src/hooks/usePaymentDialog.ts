
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
  const [isWaveRedirect, setIsWaveRedirect] = useState(false);
  const navigate = useNavigate();
  const { mutate: insertPayment } = useInsertPayment();

  // Check if this is a Wave redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const waveSuccess = urlParams.get('wave_success');
    const waveOrderRef = urlParams.get('order_ref');
    
    if ((waveSuccess === 'true' && waveOrderRef) || urlParams.get('wave_cancel') === 'true') {
      setIsWaveRedirect(true);
    }
  }, []);

  const handleMobilePayment = () => {
    if (!cvId) {
      toast({
        title: "Erreur",
        description: "Impossible d'identifier le CV à télécharger",
        variant: "destructive"
      });
      onClose();
      return;
    }
    
    // Track the CV being paid for
    localStorage.setItem('cv_being_paid', cvId);
    
    // Get current user ID
    const userId = localStorage.getItem('current_user_id');
    
    if (!userId) {
      toast({
        title: "Erreur",
        description: "Utilisateur non identifié",
        variant: "destructive"
      });
      onClose();
      return;
    }
    
    // Store payment attempt details
    localStorage.setItem('payment_attempt', JSON.stringify({
      cvId,
      userId,
      timestamp: Date.now(),
      orderRef: `WAVE_${Date.now()}`
    }));
    
    // Define Wave payment URL with required parameters
    const WAVE_PAYMENT_URL = "https://pay.wave.com/m/M_ci_C5jSUwlXR3P5/c/ci/?amount=1000";
    
    // Open Wave payment page
    window.location.href = WAVE_PAYMENT_URL;
  };

  const handleVerifyPayment = async () => {
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
      
      // Check for Wave payment return parameters in URL
      const urlParams = new URLSearchParams(window.location.search);
      const waveSuccess = urlParams.get('wave_success');
      const waveOrderRef = urlParams.get('order_ref');
      
      // Verify payment only if Wave success parameter is present
      if (waveSuccess === 'true' && waveOrderRef && cvId === localStorage.getItem('cv_being_paid')) {
        console.log("Verifying Wave payment via URL parameters");
        
        // Verify with Supabase
        const { data, error } = await supabase.rpc('verify_payment', {
          p_user_id: userId,
          p_cv_id: cvId,
          p_amount: 1000,
          p_transaction_id: waveOrderRef
        });
        
        if (error) {
          console.error("Payment verification error:", error);
          throw error;
        }
        
        // Update download count and clean up
        updateDownloadCount(cvId, true);
        localStorage.removeItem('cv_being_paid');
        localStorage.removeItem('payment_attempt');
        
        // Clean URL parameters
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        
        setVerificationStatus('success');
        
        // Find the CV in localStorage for download
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
        // If no Wave parameters are present, inform user to complete payment first
        throw new Error("Aucune confirmation de paiement Wave détectée");
      }
    } catch (error) {
      console.error("Error during payment verification:", error);
      setVerificationStatus('error');
      setIsProcessing(false);
      
      // Show specific error message
      toast({
        title: "Échec de la vérification",
        description: error instanceof Error ? error.message : "Veuillez d'abord effectuer le paiement avant de vérifier",
        variant: "destructive"
      });
    }
  };

  return {
    isProcessing,
    verificationStatus,
    isWaveRedirect,
    handlePayment: handleMobilePayment,
    handleVerifyPayment
  };
};
