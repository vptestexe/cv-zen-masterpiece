
export interface DownloadCount {
  count: number;
  lastPaymentDate: string;
}

export interface DownloadCounts {
  [cvId: string]: DownloadCount;
}

// Configuration constants
export const PAYMENT_AMOUNT = 500; // Coût en F CFA pour les téléchargements
export const MAX_FREE_CVS = 100; // Augmenté à 100 pour permettre plus de CVs gratuits
export const FREE_DOWNLOADS_PER_CV = 0; // Aucun téléchargement gratuit
export const PAID_DOWNLOADS_PER_CV = 2; // 2 téléchargements après paiement
