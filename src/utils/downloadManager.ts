interface DownloadCount {
  count: number;
  lastPaymentDate: string;
}

interface DownloadCounts {
  [cvId: string]: DownloadCount;
}

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
  return 0;
};

export const isFreeDownloadAvailable = (cvId: string): boolean => {
  const currentCv = getDownloadCount(cvId);
  return currentCv.count > 0;
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
  } else {
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
  const { count } = getDownloadCount(cvId);
  return count > 0;
};

export const resetCVPaymentStatus = () => {
  localStorage.removeItem('cv_being_paid');
};

export const setInitialDownloadCount = (cvId: string, count: number = 0): DownloadCount => {
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
      count: 0,
      lastPaymentDate: ''
    };
    
    localStorage.setItem('cv_download_counts', JSON.stringify(parsedCounts));
    console.log(`Compteur initialisé pour le CV ${cvId} à 0 téléchargements`);
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
