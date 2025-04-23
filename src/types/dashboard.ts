
export interface DashboardState {
  userCVs: any[];
  setUserCVs: (cvs: any[]) => void;
  userName: string;
  setUserName: (name: string) => void;
  isAuthenticated: boolean;
  user: any;
  logout: () => void;
  isMobile: boolean;
  paymentVerified: Record<string, boolean>;
  setPaymentVerified: (state: Record<string, boolean>) => void;
  processingPayment: boolean;
  setProcessingPayment: (processing: boolean) => void;
  downloadCounts: Record<string, { count: number; lastPaymentDate: string }>;
  setDownloadCounts: (counts: Record<string, { count: number; lastPaymentDate: string }>) => void;
  showPaymentDialog: boolean;
  setShowPaymentDialog: (show: boolean) => void;
  currentCvId: string | null;
  setCurrentCvId: (id: string | null) => void;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;
  cvToDelete: string | null;
  setCvToDelete: (id: string | null) => void;
  showDuplicateAlert: boolean;
  setShowDuplicateAlert: (show: boolean) => void;
  duplicatesFound: number;
  setDuplicatesFound: (count: number) => void;
  lastActivity: number;
  setLastActivity: (time: number) => void;
  sessionExpired: boolean;
  setSessionExpired: (expired: boolean) => void;
  navigate: (path: string) => void;
  toast: any;
}
