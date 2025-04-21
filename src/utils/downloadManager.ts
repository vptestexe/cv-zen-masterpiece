
interface DownloadCount {
  count: number;
  lastPaymentDate: string;
}

interface DownloadCounts {
  [cvId: string]: DownloadCount;
}

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
  const { count } = getDownloadCount(cvId);
  return count > 0;
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
  
  // Ne réinitialise que si le CV n'a pas déjà un compteur
  if (!parsedCounts[cvId]) {
    parsedCounts[cvId] = { count, lastPaymentDate: new Date().toISOString() };
    localStorage.setItem('cv_download_counts', JSON.stringify(parsedCounts));
    console.log(`Compteur initialisé pour le CV ${cvId} à ${count} téléchargements`);
  }
  
  return parsedCounts[cvId];
};
