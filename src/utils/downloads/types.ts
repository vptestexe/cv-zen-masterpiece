
export interface DownloadCount {
  count: number;
  lastPaymentDate: string;
}

export interface DownloadCounts {
  [cvId: string]: DownloadCount;
}

// Configuration constants
export const PAYMENT_AMOUNT = 500; // Coût en F CFA pour les téléchargements
export const MAX_FREE_CVS = 2;
export const FREE_DOWNLOADS_PER_CV = 2; // Nombre de téléchargements gratuits par CV


