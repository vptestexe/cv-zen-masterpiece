
import { MAX_FREE_CVS } from './types';
import { getSavedCVs, saveCVs } from './storage';

export const getTotalCVs = (): number => {
  try {
    const savedCVsJSON = localStorage.getItem('saved_cvs');
    if (!savedCVsJSON) return 0;
    
    const savedCVs = JSON.parse(savedCVsJSON);
    const uniqueCVs = removeDuplicateCVs(savedCVs);
    
    if (uniqueCVs.length !== savedCVs.length) {
      localStorage.setItem('saved_cvs', JSON.stringify(uniqueCVs));
      console.log(`${savedCVs.length - uniqueCVs.length} CV(s) en double ont été supprimés.`);
    }
    
    return uniqueCVs.length;
  } catch (e) {
    console.error("Erreur lors du comptage des CV:", e);
    return 0;
  }
};

export const removeDuplicateCVs = (cvs: any[]): any[] => {
  if (!Array.isArray(cvs)) return [];
  
  const uniqueCVsMap = new Map();
  
  cvs.forEach(cv => {
    if (!cv) return;
    
    const contentHash = (cv.title || '') + (cv.personalInfo?.name || '') + (cv.personalInfo?.email || '');
    const lastModified = cv.lastUpdated || '';
    
    if (!uniqueCVsMap.has(contentHash) || 
        new Date(lastModified) > new Date(uniqueCVsMap.get(contentHash).lastUpdated)) {
      uniqueCVsMap.set(contentHash, cv);
    }
  });
  
  return Array.from(uniqueCVsMap.values());
};

export const canCreateNewCV = (): boolean => {
  try {
    if (typeof MAX_FREE_CVS !== 'number') {
      console.warn("MAX_FREE_CVS n'est pas défini correctement, autorisation accordée par défaut");
      return true;
    }
    
    const totalCVs = getTotalCVs();
    return totalCVs < MAX_FREE_CVS;
  } catch (error) {
    console.error("Erreur lors de la vérification du nombre de CV:", error);
    return true;
  }
};

export const hasDownloadsRemaining = (): boolean => {
  return true; // Toujours retourner true car les téléchargements sont maintenant gratuits
};

export const isFreeDownloadAvailable = (): boolean => {
  return true; // Toujours retourner true car les téléchargements sont maintenant gratuits
};

export const resetCVPaymentStatus = () => {
  try {
    localStorage.removeItem('cv_being_paid');
    localStorage.removeItem('payment_attempt');
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du statut de paiement:", error);
  }
};

// Track payment attempt details with better validation (conservé pour compatibilité)
export const trackPaymentAttempt = (cvId: string, userId: string) => {
  try {
    const orderRef = `FREE_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    
    const paymentAttempt = {
      cvId,
      userId,
      timestamp: Date.now(),
      orderRef,
      amount: 0 // Montant zéro car gratuit
    };
    
    localStorage.setItem('payment_attempt', JSON.stringify(paymentAttempt));
    return orderRef;
  } catch (error) {
    console.error("Erreur lors du suivi de la tentative de téléchargement:", error);
    return null;
  }
};

export const validatePaymentReference = (orderRef: string): boolean => {
  return true; // Toujours valider car gratuit
};
