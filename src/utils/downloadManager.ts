
interface DownloadCount {
  count: number;
  lastPaymentDate: string;
}

interface DownloadCounts {
  [cvId: string]: DownloadCount;
}

// Nombre maximum de CV gratuits
const MAX_FREE_CVS = 2;

// Prix du téléchargement en CFA
export const PAYMENT_AMOUNT = 1000;

export const getDownloadCount = (cvId: string): DownloadCount => {
  const counts = localStorage.getItem('cv_download_counts');
  if (counts) {
    try {
      const parsedCounts: DownloadCounts = JSON.parse(counts);
      return parsedCounts[cvId] || { count: 0, lastPaymentDate: '' };
    } catch (error) {
      console.error("Erreur lors de la récupération des compteurs:", error);
      return { count: 0, lastPaymentDate: '' };
    }
  }
  return { count: 0, lastPaymentDate: '' };
};

export const getTotalFreeDownloads = (): number => {
  const counts = localStorage.getItem('cv_download_counts');
  if (!counts) return 0;
  
  try {
    const parsedCounts: DownloadCounts = JSON.parse(counts);
    // Compter uniquement les CV créés gratuitement (pas ceux qui ont été payés)
    return Object.values(parsedCounts).filter(count => !count.lastPaymentDate).length;
  } catch (error) {
    console.error("Erreur lors du calcul des CV gratuits:", error);
    return 0;
  }
};

export const isFreeDownloadAvailable = (cvId: string): boolean => {
  // Si ce CV a déjà des téléchargements, on vérifie son compteur
  const currentCv = getDownloadCount(cvId);
  if (currentCv.count > 0 || currentCv.lastPaymentDate) {
    return currentCv.count > 0;
  }
  
  // Sinon, on vérifie le quota total de CV gratuits
  return getTotalFreeDownloads() < MAX_FREE_CVS;
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
    // Reset count and update payment date when new payment is verified
    console.log(`Réinitialisation du compteur pour le CV ${cvId} après paiement vérifié`);
    parsedCounts[cvId] = { count: 5, lastPaymentDate: new Date().toISOString() };
  } else {
    // Decrease remaining downloads
    const current = parsedCounts[cvId] || { count: 0, lastPaymentDate: '' };
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
  // Si le CV a déjà un compteur, on vérifie s'il lui reste des téléchargements
  const { count } = getDownloadCount(cvId);
  if (count > 0) return true;
  
  // Sinon, vérifier si on peut encore créer un CV gratuit
  return isFreeDownloadAvailable(cvId);
};

export const resetCVPaymentStatus = () => {
  localStorage.removeItem('cv_being_paid');
};

export const setInitialDownloadCount = (cvId: string, count: number = 5): DownloadCount => {
  // Cette fonction est utilisée pour initialiser le compteur pour un nouveau CV
  const counts = localStorage.getItem('cv_download_counts') || '{}';
  let parsedCounts: DownloadCounts;
  
  try {
    parsedCounts = JSON.parse(counts);
  } catch (error) {
    console.error("Erreur lors de l'analyse des compteurs:", error);
    parsedCounts = {};
  }
  
  // Vérifier si on peut encore créer un CV gratuit
  const freeDownloadsAvailable = getTotalFreeDownloads() < MAX_FREE_CVS;
  
  // Ne réinitialise que si le CV n'a pas déjà un compteur
  if (!parsedCounts[cvId]) {
    const initialCount = freeDownloadsAvailable ? count : 0;
    const paymentDate = freeDownloadsAvailable ? '' : new Date().toISOString(); // Marquer comme nécessitant un paiement
    
    parsedCounts[cvId] = { 
      count: initialCount, 
      lastPaymentDate: paymentDate 
    };
    
    localStorage.setItem('cv_download_counts', JSON.stringify(parsedCounts));
    console.log(`Compteur initialisé pour le CV ${cvId} à ${initialCount} téléchargements`);
  }
  
  return parsedCounts[cvId];
};

// Ajouter une couche de sécurité pour les données
export const secureStorage = {
  set: (key: string, value: any): void => {
    try {
      // Encodage basique des données avant de les stocker
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
      
      // Décodage des données
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
