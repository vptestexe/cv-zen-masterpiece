
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  getSavedCVs,
  saveCVs,
  secureStorage,
  removeDuplicateCVs,
  getDownloadCount,
  setInitialDownloadCount
} from "@/utils/downloadManager";

export const useCVDataSync = (state: any) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!state.isAuthenticated) {
      return;
    }

    const userId = state.user?.id;
    const lastLoggedInUser = localStorage.getItem('last_logged_in_user');
    
    if (userId !== lastLoggedInUser) {
      localStorage.removeItem('saved_cvs');
      localStorage.removeItem('cv_download_counts');
      secureStorage.remove('saved_cvs_backup');
      localStorage.setItem('last_logged_in_user', userId || '');
    }
    
    let savedCVs = getSavedCVs();
    const secureBackup = secureStorage.get('saved_cvs_backup', null);
    
    if (!savedCVs.length && secureBackup && secureBackup.length) {
      savedCVs = secureBackup;
      saveCVs(savedCVs);
      toast({
        title: "Récupération de données",
        description: "Les données sauvegardées ont été restaurées avec succès.",
        variant: "default"
      });
    }
    
    const originalCount = savedCVs.length;
    const uniqueCVs = removeDuplicateCVs(savedCVs);
    const duplicatesRemoved = originalCount - uniqueCVs.length;
    
    if (duplicatesRemoved > 0) {
      state.setDuplicatesFound(duplicatesRemoved);
      state.setShowDuplicateAlert(true);
      saveCVs(uniqueCVs);
    }
    
    state.setUserCVs(uniqueCVs);
    
    const counts = uniqueCVs.reduce((acc: any, cv: any) => {
      if (!getDownloadCount(cv.id).count && !getDownloadCount(cv.id).lastPaymentDate) {
        acc[cv.id] = setInitialDownloadCount(cv.id);
      } else {
        acc[cv.id] = getDownloadCount(cv.id);
      }
      return acc;
    }, {});
    
    state.setDownloadCounts(counts);
  }, [state.isAuthenticated, state.user, toast]);
};
