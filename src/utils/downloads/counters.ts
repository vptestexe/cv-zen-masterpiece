import { DownloadCount, DownloadCounts, FREE_DOWNLOADS_PER_CV, PAID_DOWNLOADS_PER_CV } from './types';

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
    parsedCounts[cvId] = { count: PAID_DOWNLOADS_PER_CV, lastPaymentDate: new Date().toISOString() };
  } else {
    if (!parsedCounts[cvId]) {
      parsedCounts[cvId] = { count: 0, lastPaymentDate: '' };
    }
    
    const current = parsedCounts[cvId];
    if (current.count > 0) {
      current.count--;
      parsedCounts[cvId] = current;
    }
  }
  
  localStorage.setItem('cv_download_counts', JSON.stringify(parsedCounts));
  return parsedCounts[cvId] || { count: 0, lastPaymentDate: '' };
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
      count: 0,
      lastPaymentDate: ''
    };
    
    localStorage.setItem('cv_download_counts', JSON.stringify(parsedCounts));
  }
  
  return parsedCounts[cvId];
};
