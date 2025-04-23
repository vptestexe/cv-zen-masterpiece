
// Réexporter tout depuis les nouveaux modules
export * from './downloads';

// Réexportation explicite de la fonction pour assurer qu'elle est bien disponible
import { isFreeDownloadAvailable, PAYMENT_AMOUNT, FREE_DOWNLOADS_PER_CV, MAX_FREE_CVS } from './downloads';
export { isFreeDownloadAvailable, PAYMENT_AMOUNT, FREE_DOWNLOADS_PER_CV, MAX_FREE_CVS };
