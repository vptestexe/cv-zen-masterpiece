
import { useCVContext } from "@/contexts/CVContext";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useCallback, useState, useEffect, useRef } from "react";
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
  const initialized = useRef(false);

  const refreshPreview = useCallback(() => {
    setPreviewResetKey((prev) => prev + 1);
  }, []);

  // Compose splitted hooks:
  const { handleDownloadCV } = useCVDownload({
    getCurrentCV: () => {
      try {
        const savedCVsJSON = localStorage.getItem("saved_cvs");
        if (!savedCVsJSON || !currentCVId) return null;
        const savedCVs = JSON.parse(savedCVsJSON);
        return savedCVs.find((cv: any) => cv.id === currentCVId) || null;
      } catch (e) {
        console.error("Erreur lors de la récupération du CV:", e);
        return null;
      }
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

  // Vérification des téléchargements disponibles
  useEffect(() => {
    if (currentCVId) {
      try {
        const isAvailable = isFreeDownloadAvailable(currentCVId);
        setFreeDownloadAvailable(isAvailable);
      } catch (error) {
        console.error("Erreur lors de la vérification des téléchargements disponibles:", error);
        setFreeDownloadAvailable(false);
      }
    }
  }, [currentCVId]);

  // Chargement du CV depuis l'URL
  useEffect(() => {
    if (initialized.current) return;
    
    try {
      const stateWithId = location.state as { cvId?: string } | null;
      let cvIdToLoad = null;
      
      if (stateWithId?.cvId) {
        cvIdToLoad = stateWithId.cvId;
      } else {
        const params = new URLSearchParams(location.search);
        const cvIdParam = params.get("cvId");
        if (cvIdParam) {
          cvIdToLoad = cvIdParam;
        }
      }
      
      if (cvIdToLoad) {
        console.log("Chargement du CV:", cvIdToLoad);
        setCurrentCVId(cvIdToLoad);
        loadSavedCV(cvIdToLoad);
        initialized.current = true;
      }
    } catch (error) {
      console.error("Erreur lors du chargement initial du CV:", error);
    }
  }, [location, loadSavedCV]);

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
