
export interface DownloadCount {
  count: number;
  lastPaymentDate: string;
}

export interface DownloadCounts {
  [cvId: string]: DownloadCount;
}

// Configuration constants
export const PAYMENT_AMOUNT = import.meta.env.PROD ? 1000 : 50;
export const MAX_FREE_CVS = 2;
export const FREE_DOWNLOADS_PER_CV = 2;
