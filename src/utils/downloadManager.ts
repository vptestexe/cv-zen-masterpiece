
interface DownloadCount {
  count: number;
  lastPaymentDate: string;
}

interface DownloadCounts {
  [cvId: string]: DownloadCount;
}

// Prix du téléchargement en CFA
export const PAYMENT_AMOUNT = import.meta.env.PROD ? 1000 : 50;

// Nombre maximum de CVs gratuits qu'un utilisateur peut créer
export const MAX_FREE_CVS = 2;

// Nombre de téléchargements gratuits par CV
export const FREE_DOWNLOADS_PER_CV = 2;

export const getDownloadCount = (cvId: string): DownloadCount => {
  const counts = localStorage.getItem('cv_download_counts');
  if (counts) {
    try {
      const parsedCounts: DownloadCounts = JSON.parse(counts);
      return parsedCounts[cvId] || { count: FREE_DOWNLOADS_PER_CV, lastPaymentDate: '' };
    } catch (error) {
      console.error("Erreur lors de la récupération des compteurs:", error);
      return { count: FREE_DOWNLOADS_PER_CV, lastPaymentDate: '' };
    }
  }
  return { count: FREE_DOWNLOADS_PER_CV, lastPaymentDate: '' };
};

export const getTotalFreeDownloads = (): number => {
  const counts = localStorage.getItem('cv_download_counts');
  if (counts) {
    try {
      const parsedCounts: DownloadCounts = JSON.parse(counts);
      return Object.values(parsedCounts).reduce((total, cv) => total + (cv.count > 0 ? 1 : 0), 0);
    } catch (error) {
      console.error("Erreur lors de la récupération des compteurs pour le total:", error);
      return 0;
    }
  }
  return 0;
};

// Fonction pour compter le nombre total de CVs
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

// Fonction utilitaire pour détecter les CVs en double
export const removeDuplicateCVs = (cvs: any[]): any[] => {
  // Créer un Map pour stocker les CV uniques basés sur leur contenu
  const uniqueCVsMap = new Map();
  
  cvs.forEach(cv => {
    // Créer une clé de hachage basée sur des attributs pertinents
    const contentHash = cv.title + (cv.personalInfo?.name || '') + (cv.personalInfo?.email || '');
    const lastModified = cv.lastUpdated || '';
    
    // Si ce contenu n'existe pas encore, ou si c'est une version plus récente, l'ajouter
    if (!uniqueCVsMap.has(contentHash) || 
        new Date(lastModified) > new Date(uniqueCVsMap.get(contentHash).lastUpdated)) {
      uniqueCVsMap.set(contentHash, cv);
    }
  });
  
  // Convertir la Map en tableau
  return Array.from(uniqueCVsMap.values());
};

export const isFreeDownloadAvailable = (cvId: string): boolean => {
  const currentCv = getDownloadCount(cvId);
  return currentCv.count > 0;
};

export const canCreateNewCV = (): boolean => {
  const totalCVs = getTotalCVs();
  return totalCVs < MAX_FREE_CVS;
};

export const updateDownloadCount = (cvId: string, paymentVerified: boolean = false): DownloadCount => {
  const counts = localStorage.getItem('cv_download_counts') || '{}';
  let parsedCounts: DownloadCounts;
  
  try {
    parsedCounts = JSON.parse(counts);
  } catch (error) {
    console.error("Erreur lors de l'analyse des compteurs:", error);
    parsedCounts = {};
  }
  
  if (paymentVerified) {
    console.log(`Réinitialisation du compteur pour le CV ${cvId} après paiement vérifié`);
    parsedCounts[cvId] = { count: 5, lastPaymentDate: new Date().toISOString() };
    
    // Forcer le rafraîchissement du localStorage
    localStorage.setItem('cv_download_counts', JSON.stringify(parsedCounts));
    
    // Envoyer un événement personnalisé pour notifier le rafraîchissement
    window.dispatchEvent(new CustomEvent('downloadCountUpdated', { detail: { cvId } }));
  } else {
    // Si ce CV n'a pas de compteur, initialiser avec les téléchargements gratuits
    if (!parsedCounts[cvId]) {
      parsedCounts[cvId] = { count: FREE_DOWNLOADS_PER_CV, lastPaymentDate: '' };
      console.log(`Compteur initialisé pour le CV ${cvId} avec ${FREE_DOWNLOADS_PER_CV} téléchargements gratuits`);
    }
    
    const current = parsedCounts[cvId];
    if (current.count > 0) {
      current.count--;
      parsedCounts[cvId] = current;
      console.log(`Téléchargement utilisé pour le CV ${cvId}, reste ${current.count}`);
    } else {
      console.log(`Aucun téléchargement disponible pour le CV ${cvId}`);
    }
  }
  
  localStorage.setItem('cv_download_counts', JSON.stringify(parsedCounts));
  return parsedCounts[cvId] || { count: 0, lastPaymentDate: '' };
};

export const hasDownloadsRemaining = (cvId: string): boolean => {
  const { count } = getDownloadCount(cvId);
  return count > 0;
};

export const resetCVPaymentStatus = () => {
  localStorage.removeItem('cv_being_paid');
};

export const setInitialDownloadCount = (cvId: string): DownloadCount => {
  const counts = localStorage.getItem('cv_download_counts') || '{}';
  let parsedCounts: DownloadCounts;
  
  try {
    parsedCounts = JSON.parse(counts);
  } catch (error) {
    console.error("Erreur lors de l'analyse des compteurs:", error);
    parsedCounts = {};
  }
  
  if (!parsedCounts[cvId]) {
    parsedCounts[cvId] = { 
      count: FREE_DOWNLOADS_PER_CV,
      lastPaymentDate: ''
    };
    
    localStorage.setItem('cv_download_counts', JSON.stringify(parsedCounts));
    console.log(`Compteur initialisé pour le CV ${cvId} à ${FREE_DOWNLOADS_PER_CV} téléchargements gratuits`);
  }
  
  return parsedCounts[cvId];
};

export const secureStorage = {
  set: (key: string, value: any): void => {
    try {
      const encodedValue = btoa(JSON.stringify(value));
      localStorage.setItem(`secure_${key}`, encodedValue);
    } catch (error) {
      console.error(`Erreur lors de l'enregistrement des données sécurisées pour ${key}:`, error);
    }
  },
  
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const storedValue = localStorage.getItem(`secure_${key}`);
      if (!storedValue) return defaultValue;
      
      const decodedValue = JSON.parse(atob(storedValue));
      return decodedValue as T;
    } catch (error) {
      console.error(`Erreur lors de la récupération des données sécurisées pour ${key}:`, error);
      return defaultValue;
    }
  },
  
  remove: (key: string): void => {
    localStorage.removeItem(`secure_${key}`);
  }
};

// Fonction pour sauvegarder les CVs dans le localStorage
export const saveCVs = (cvs: any[]): void => {
  localStorage.setItem('saved_cvs', JSON.stringify(cvs));
  
  // Création d'une sauvegarde sécurisée
  secureStorage.set('saved_cvs_backup', cvs);
};

// Fonction pour récupérer les CVs sauvegardés
export const getSavedCVs = (): any[] => {
  const savedCVsJSON = localStorage.getItem('saved_cvs');
  if (savedCVsJSON) {
    try {
      return JSON.parse(savedCVsJSON);
    } catch (e) {
      console.error("Erreur lors de la récupération des CV:", e);
      return [];
    }
  }
  return [];
};
