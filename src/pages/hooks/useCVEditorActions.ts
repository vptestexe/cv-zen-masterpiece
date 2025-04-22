
import { useCVContext } from "@/contexts/CVContext";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useCallback, useState, useEffect } from "react";
import { isFreeDownloadAvailable } from "@/utils/downloadManager";
import { useCVDownload } from "./useCVDownload";
import { useCVSave } from "./useCVSave";
import { useCVNavigation } from "./useCVNavigation";

export function useCVEditorActions() {
  const { resetCV, cvData, cvTheme, setInitialTheme } = useCVContext();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { templateId } = useParams<{ templateId?: string }>();
  const [currentCVId, setCurrentCVId] = useState<string | null>(null);

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [previewResetKey, setPreviewResetKey] = useState(0);
  const [freeDownloadAvailable, setFreeDownloadAvailable] = useState(true);

  // Compose splitted hooks:
  const { handleDownloadCV } = useCVDownload({
    getCurrentCV: () => {
      const savedCVsJSON = localStorage.getItem("saved_cvs");
      if (!savedCVsJSON || !currentCVId) return null;
      const savedCVs = JSON.parse(savedCVsJSON);
      const found = savedCVs.find((cv: any) => cv.id === currentCVId);
      return found;
    },
    refreshPreview,
  });

  const { handleSaveCV, loadSavedCV } = useCVSave({
    cvData,
    cvTheme,
    templateId,
    setInitialTheme,
    refreshPreview,
  });

  const { handleResetCV, handleBackToDashboard } = useCVNavigation({
    resetCV,
    refreshPreview,
  });

  useEffect(() => {
    if (currentCVId) {
      setFreeDownloadAvailable(isFreeDownloadAvailable(currentCVId));
    }
  }, [currentCVId]);

  useEffect(() => {
    const stateWithId = location.state as { cvId?: string } | null;
    if (stateWithId?.cvId) {
      setCurrentCVId(stateWithId.cvId);
      loadSavedCV(stateWithId.cvId);
    } else {
      const params = new URLSearchParams(location.search);
      const cvId = params.get("cvId");
      if (cvId) {
        setCurrentCVId(cvId);
        loadSavedCV(cvId);
      }
    }
    // eslint-disable-next-line
  }, [location]);

  const refreshPreview = useCallback(() => {
    setPreviewResetKey((prev) => prev + 1);
  }, []);

  return {
    currentCVId,
    lastSaved,
    freeDownloadAvailable,
    handleSaveCV: (...args: any[]) => handleSaveCV(currentCVId, setCurrentCVId, ...args),
    handleResetCV,
    handleBackToDashboard,
    handleDownloadCV: (format: "pdf" | "word" = "pdf") => handleDownloadCV(format, currentCVId, setFreeDownloadAvailable),
    previewResetKey,
    refreshPreview,
    setFreeDownloadAvailable,
  };
}
