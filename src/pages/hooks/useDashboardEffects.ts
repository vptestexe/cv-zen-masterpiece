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
      
      // Store current user ID in localStorage for payment processing
      if (state.user?.id) {
        localStorage.setItem('current_user_id', state.user.id);
      }
      
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

      // Vérifier si on revient d'un paiement RayCash/PayLink
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment_status');
      
      // Récupérer les informations de la tentative de paiement
      const paymentAttemptJson = localStorage.getItem('payment_attempt');
      const paymentAttempt = paymentAttemptJson ? JSON.parse(paymentAttemptJson) : null;
      
      console.log("Vérification du paiement:", { 
        paymentStatus, 
        paymentAttempt, 
        cvBeingPaid,
        userId: state.user?.id
      });
      
      // Si on revient avec un statut de succès et que les informations correspondent
      if (paymentStatus === 'success' && paymentAttempt && 
          paymentAttempt.cvId === cvBeingPaid && 
          paymentAttempt.userId === state.user?.id) {
            
        state.setProcessingPayment(true);
        
        try {
          // Enregistrer le paiement en base de données
          await insertPayment({
            userId: state.user.id,
            cvId: cvBeingPaid,
            amount: PAYMENT_AMOUNT,
            transactionId: paymentAttempt.orderRef || null,
          });
          
          // Mettre à jour le compteur de téléchargements
          const updatedCount = updateDownloadCount(cvBeingPaid, true);
          state.setDownloadCounts((prev: any) => ({
            ...prev,
            [cvBeingPaid]: updatedCount
          }));
          
          // Nettoyer les données temporaires
          localStorage.removeItem('cv_being_paid');
          localStorage.removeItem('payment_attempt');
          
          // Nettoyer l'URL
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
          
          state.setProcessingPayment(false);
          
          state.toast({
            title: "Paiement confirmé",
            description: "Vous disposez maintenant de 5 téléchargements pour ce CV.",
          });
        } catch (error) {
          console.error("Payment verification error:", error);
          state.setProcessingPayment(false);
          state.toast({
            title: "Erreur enregistrement paiement",
            description: "Impossible d'enregistrer le paiement en base",
            variant: "destructive"
          });
        }
      } else if (paymentStatus === 'cancel') {
        // Nettoyer l'URL en cas d'annulation
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        
        state.toast({
          title: "Paiement annulé",
          description: "Vous avez annulé le processus de paiement",
          variant: "default"
        });
      }
    };
    
    // Vérifier le statut du paiement au chargement de la page
    verifyPayment();
    
  }, [state.processingPayment, state.user]);
}
