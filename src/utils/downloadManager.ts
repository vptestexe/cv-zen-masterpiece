
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
    const parsedCounts: DownloadCounts = JSON.parse(counts);
    return parsedCounts[cvId] || { count: 0, lastPaymentDate: '' };
  }
  return { count: 0, lastPaymentDate: '' };
};

export const updateDownloadCount = (cvId: string, paymentVerified: boolean = false) => {
  const counts = localStorage.getItem('cv_download_counts') || '{}';
  const parsedCounts: DownloadCounts = JSON.parse(counts);
  
  if (paymentVerified) {
    // Reset count and update payment date when new payment is verified
    parsedCounts[cvId] = { count: 5, lastPaymentDate: new Date().toISOString() };
  } else {
    // Decrease remaining downloads
    const current = parsedCounts[cvId] || { count: 0, lastPaymentDate: '' };
    if (current.count > 0) {
      current.count--;
      parsedCounts[cvId] = current;
    }
  }
  
  localStorage.setItem('cv_download_counts', JSON.stringify(parsedCounts));
  return parsedCounts[cvId];
};

export const hasDownloadsRemaining = (cvId: string): boolean => {
  const { count } = getDownloadCount(cvId);
  return count > 0;
};

export const resetCVPaymentStatus = () => {
  localStorage.removeItem('cv_being_paid');
};
