
// Export central des fonctionnalités de téléchargement
export * from './downloads';

// Re-export explicite des fonctions importantes pour garantir l'accessibilité
export { isFreeDownloadAvailable, canCreateNewCV, hasDownloadsRemaining, getTotalCVs, removeDuplicateCVs, resetCVPaymentStatus } from './downloads/utils';
export { updateDownloadCount, getDownloadCount, setInitialDownloadCount } from './downloads/counters';
export { saveCVs, getSavedCVs, secureStorage } from './downloads/storage';
export { MAX_FREE_CVS, PAYMENT_AMOUNT } from './downloads/types';
