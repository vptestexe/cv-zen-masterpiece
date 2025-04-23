
import { MAX_FREE_CVS } from './types';
import { getSavedCVs, saveCVs } from './storage';

export const getTotalCVs = (): number => {
  try {
    const savedCVsJSON = localStorage.getItem('saved_cvs');
    if (!savedCVsJSON) return 0;
    
    const savedCVs = JSON.parse(savedCVsJSON);
    // Détecter et supprimer les doublons basés sur le contenu
    const uniqueCVs = removeDuplicateCVs(savedCVs);
    
    // Si des doublons ont été supprimés, mettre à jour le stockage
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
    // Pour garantir la compatibilité, retourner toujours true si MAX_FREE_CVS n'est pas défini
    if (typeof MAX_FREE_CVS !== 'number') {
      console.warn("MAX_FREE_CVS n'est pas défini correctement, autorisation accordée par défaut");
      return true;
    }
    
    const totalCVs = getTotalCVs();
    // Vérifier si on est en-dessous de la limite
    return totalCVs < MAX_FREE_CVS;
  } catch (error) {
    console.error("Erreur lors de la vérification du nombre de CV:", error);
    // En cas d'erreur, permettre la création de CV par défaut pour éviter de bloquer l'utilisateur
    return true;
  }
};

export const hasDownloadsRemaining = (cvId: string): boolean => {
  try {
    if (!cvId) return false;
    
    const counts = localStorage.getItem('cv_download_counts');
    if (!counts) return false;
    
    const parsedCounts = JSON.parse(counts);
    return parsedCounts[cvId]?.count > 0;
  } catch (error) {
    console.error("Erreur lors de la vérification des téléchargements restants:", error);
    return false;
  }
};

// Fonction simplifiée et robuste pour la vérification des téléchargements
export const isFreeDownloadAvailable = (cvId: string): boolean => {
  try {
    if (!cvId) {
      console.warn("isFreeDownloadAvailable appelé sans ID de CV");
      return false;
    }
    return hasDownloadsRemaining(cvId);
  } catch (error) {
    console.error("Erreur dans isFreeDownloadAvailable:", error);
    return false;
  }
};

export const resetCVPaymentStatus = () => {
  try {
    localStorage.removeItem('cv_being_paid');
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du statut de paiement:", error);
  }
};
