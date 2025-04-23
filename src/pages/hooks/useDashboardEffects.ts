
import { useEffect } from "react";
import { useInsertPayment } from "@/hooks/use-payments";
import { 
  getSavedCVs, 
  saveCVs, 
  resetCVPaymentStatus,
  removeDuplicateCVs,
  getDownloadCount,
  setInitialDownloadCount,
  updateDownloadCount,
  PAYMENT_AMOUNT,
  secureStorage
} from "@/utils/downloadManager";

export function useDashboardEffects(state: any) {
  const { mutate: insertPayment } = useInsertPayment();

  useEffect(() => {
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    
    const checkSession = () => {
      const currentTime = Date.now();
      if (currentTime - state.lastActivity > SESSION_TIMEOUT) {
        state.setSessionExpired(true);
        state.handleLogout();
      }
    };
    
    const sessionTimer = setInterval(checkSession, 60000);
    
    const resetTimer = () => {
      state.setLastActivity(Date.now());
    };
    
    window.addEventListener('click', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('scroll', resetTimer);
    window.addEventListener('mousemove', resetTimer);
    
    return () => {
      clearInterval(sessionTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('mousemove', resetTimer);
    };
  }, [state.lastActivity]);

  useEffect(() => {
    if (!state.isAuthenticated) {
      state.navigate("/login");
      
      if (!state.isMobile) {
        state.toast({
          title: "Accès refusé",
          description: "Veuillez vous connecter pour accéder à votre tableau de bord",
          variant: "destructive"
        });
      }
    } else {
      state.setUserName(state.user?.name || "Utilisateur");
      
      // Clear any previously saved CVs when a new user logs in
      const userId = state.user?.id;
      const lastLoggedInUser = localStorage.getItem('last_logged_in_user');
      
      if (userId !== lastLoggedInUser) {
        // If this is a different user or a new user, we reset the CVs
        localStorage.removeItem('saved_cvs');
        localStorage.removeItem('cv_download_counts');
        secureStorage.remove('saved_cvs_backup');
        // Store current user as last logged in
        localStorage.setItem('last_logged_in_user', userId || '');
      }
      
      let savedCVs = getSavedCVs();
      const secureBackup = secureStorage.get('saved_cvs_backup', null);
      
      if (!savedCVs.length && secureBackup && secureBackup.length) {
        savedCVs = secureBackup;
        saveCVs(savedCVs);
        state.toast({
          title: "Récupération de données",
          description: "Les données sauvegardées ont été restaurées avec succès.",
          variant: "default"
        });
      }
      
      const originalCount = savedCVs.length;
      const uniqueCVs = removeDuplicateCVs(savedCVs);
      const duplicatesRemoved = originalCount - uniqueCVs.length;
      
      if (duplicatesRemoved > 0) {
        state.setDuplicatesFound(duplicatesRemoved);
        state.setShowDuplicateAlert(true);
        saveCVs(uniqueCVs);
      }
      
      state.setUserCVs(uniqueCVs);
      
      const counts = uniqueCVs.reduce((acc: any, cv: any) => {
        if (!getDownloadCount(cv.id).count && !getDownloadCount(cv.id).lastPaymentDate) {
          acc[cv.id] = setInitialDownloadCount(cv.id);
        } else {
          acc[cv.id] = getDownloadCount(cv.id);
        }
        return acc;
      }, {});
      
      state.setDownloadCounts(counts);
    }
  }, [state.isAuthenticated]);

  useEffect(() => {
    const verifyPayment = async () => {
      const cvBeingPaid = localStorage.getItem('cv_being_paid');
      if (!cvBeingPaid || state.processingPayment) return;

      const paymentSession = secureStorage.get('payment_token', null);
      const paymentSuccessful = paymentSession &&
        paymentSession.cvId === cvBeingPaid &&
        (Date.now() - paymentSession.timestamp) < 3600000;
      const paymentAmount = PAYMENT_AMOUNT;

      if (paymentSuccessful && paymentAmount === PAYMENT_AMOUNT) {
        state.setProcessingPayment(true);
        if (state.user?.email) {
          try {
            await insertPayment(
              {
                userId: state.user.id || '',
                cvId: cvBeingPaid,
                amount: PAYMENT_AMOUNT,
                transactionId: paymentSession?.transactionId || null,
              }
            );
            
            const updatedCount = updateDownloadCount(cvBeingPaid, true);
            state.setDownloadCounts((prev: any) => ({
              ...prev,
              [cvBeingPaid]: updatedCount
            }));
            
            localStorage.removeItem('cv_being_paid');
            state.setProcessingPayment(false);
            
            state.toast({
              title: "Paiement confirmé",
              description: "Vous disposez maintenant de 5 téléchargements pour ce CV.",
            });
            
            window.location.reload();
          } catch (error) {
            console.error("Payment verification error:", error);
            state.setProcessingPayment(false);
            state.toast({
              title: "Erreur enregistrement paiement",
              description: "Impossible d'enregistrer le paiement en base",
              variant: "destructive"
            });
          }
        }
      }
    };

    const checkPaymentReturn = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment_status');
      
      if (paymentStatus) {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        verifyPayment();
      }
    };
    
    checkPaymentReturn();
    
    const cvBeingPaid = localStorage.getItem('cv_being_paid');
    if (cvBeingPaid && !state.processingPayment) {
      verifyPayment();
    }
  }, [state.processingPayment, state.user]);
}
