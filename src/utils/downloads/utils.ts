
import { MAX_FREE_CVS } from './types';
import { getSavedCVs, saveCVs } from './storage';

export const getTotalCVs = (): number => {
  const savedCVsJSON = localStorage.getItem('saved_cvs');
  if (savedCVsJSON) {
    try {
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
  }
  return 0;
};

export const removeDuplicateCVs = (cvs: any[]): any[] => {
  const uniqueCVsMap = new Map();
  
  cvs.forEach(cv => {
    const contentHash = cv.title + (cv.personalInfo?.name || '') + (cv.personalInfo?.email || '');
    const lastModified = cv.lastUpdated || '';
    
    if (!uniqueCVsMap.has(contentHash) || 
        new Date(lastModified) > new Date(uniqueCVsMap.get(contentHash).lastUpdated)) {
      uniqueCVsMap.set(contentHash, cv);
    }
  });
  
  return Array.from(uniqueCVsMap.values());
};

export const canCreateNewCV = (): boolean => {
  const totalCVs = getTotalCVs();
  return totalCVs < MAX_FREE_CVS;
};

export const hasDownloadsRemaining = (cvId: string): boolean => {
  const counts = localStorage.getItem('cv_download_counts');
  if (counts) {
    try {
      const parsedCounts = JSON.parse(counts);
      return parsedCounts[cvId]?.count > 0;
    } catch (error) {
      return false;
    }
  }
  return false;
};

export const resetCVPaymentStatus = () => {
  localStorage.removeItem('cv_being_paid');
};
