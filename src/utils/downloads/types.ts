
export interface DownloadCount {
  count: number;
  lastPaymentDate: string;
}

export interface DownloadCounts {
  [cvId: string]: DownloadCount;
}

// Configuration constants
export const PAYMENT_AMOUNT = 0; // Montant unifié à 0 F CFA pour tous les téléchargements (gratuits)
export const MAX_FREE_CVS = 100; // Augmenté à 100 pour permettre plus de CVs gratuits
export const FREE_DOWNLOADS_PER_CV = 9999; // Téléchargements illimités (pratiquement)
export const PAID_DOWNLOADS_PER_CV = 9999; // Téléchargements illimités (pratiquement)

