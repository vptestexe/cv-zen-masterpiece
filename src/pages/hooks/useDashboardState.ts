
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  getSavedCVs, 
  saveCVs, 
  resetCVPaymentStatus, 
  secureStorage,
  removeDuplicateCVs,
  getDownloadCount,
  setInitialDownloadCount,
  updateDownloadCount,
  canCreateNewCV,
  MAX_FREE_CVS 
} from "@/utils/downloadManager";
import { useInsertPayment } from "@/hooks/use-payments";
import { PAYMENT_AMOUNT } from "@/utils/downloadManager";

export function useDashboardState() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userCVs, setUserCVs] = useState([]);
  const [userName, setUserName] = useState("");
  const { isAuthenticated, user, logout } = useAuth();
  const isMobile = useIsMobile();
  const [paymentVerified, setPaymentVerified] = useState({});
  const [processingPayment, setProcessingPayment] = useState(false);
  const [downloadCounts, setDownloadCounts] = useState<{[key: string]: { count: number, lastPaymentDate: string }}>({});
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [currentCvId, setCurrentCvId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [cvToDelete, setCvToDelete] = useState<string | null>(null);
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
  const [duplicatesFound, setDuplicatesFound] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [sessionExpired, setSessionExpired] = useState(false);

  return {
    userCVs,
    setUserCVs,
    userName,
    setUserName,
    isAuthenticated,
    user,
    logout,
    isMobile,
    paymentVerified,
    setPaymentVerified,
    processingPayment,
    setProcessingPayment,
    downloadCounts,
    setDownloadCounts,
    showPaymentDialog,
    setShowPaymentDialog,
    currentCvId,
    setCurrentCvId,
    showDeleteConfirm,
    setShowDeleteConfirm,
    cvToDelete,
    setCvToDelete,
    showDuplicateAlert,
    setShowDuplicateAlert,
    duplicatesFound,
    setDuplicatesFound,
    lastActivity,
    setLastActivity,
    sessionExpired,
    setSessionExpired,
    navigate,
    toast
  };
}
