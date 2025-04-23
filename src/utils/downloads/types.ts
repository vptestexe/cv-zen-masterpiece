
export interface DownloadCount {
  count: number;
  lastPaymentDate: string;
}

export interface DownloadCounts {
  [cvId: string]: DownloadCount;
}

// Configuration constants
export const PAYMENT_AMOUNT = 0; // Coût en F CFA pour les téléchargements
export const MAX_FREE_CVS = 100; // Augmenté à 100 pour permettre plus de CVs gratuits
export const FREE_DOWNLOADS_PER_CV = 1000; // Nombre de téléchargements gratuits par CV
