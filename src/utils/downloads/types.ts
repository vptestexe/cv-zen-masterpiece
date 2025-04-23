
export interface DownloadCount {
  count: number;
  lastPaymentDate: string;
}

export interface DownloadCounts {
  [cvId: string]: DownloadCount;
}

// Configuration constants
export const PAYMENT_AMOUNT = 0; // Set to 0 to make downloads free
export const MAX_FREE_CVS = 2;
export const FREE_DOWNLOADS_PER_CV = 999; // Increased to allow unlimited downloads

