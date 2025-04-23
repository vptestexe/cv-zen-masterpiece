
import { useCVContext } from "@/contexts/CVContext";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useCallback, useState, useEffect, useRef } from "react";
import { isFreeDownloadAvailable } from "@/utils/downloadManager";
import { useCVDownload } from "./useCVDownload";
import { useCVSave } from "./useCVSave";
import { useCVNavigation } from "./useCVNavigation";
import { CVTheme } from "@/types/cv";

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
  const [isLoading, setIsLoading] = useState(true);

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

  // Chargement du CV depuis l'URL ou création d'un nouveau CV
  useEffect(() => {
    if (initialized.current) return;
    
    try {
      setIsLoading(true);
      console.log("Tentative de chargement du CV, location:", location);
      const stateData = location.state as { cvId?: string, newCv?: boolean } | null;
      
      // Vérification de l'authentification
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) {
        console.error("Authentification manquante, redirection vers login");
        navigate("/login");
        return;
      }
      
      let cvIdToLoad = null;
      let isNewCv = false;
      
      // Déterminer si c'est un CV existant à charger ou un nouveau CV à créer
      if (stateData?.cvId) {
        // Édition d'un CV existant
        cvIdToLoad = stateData.cvId;
        console.log("CV ID trouvé dans location.state:", cvIdToLoad);
      } else if (stateData?.newCv) {
        // Création d'un nouveau CV
        console.log("Création d'un nouveau CV détectée");
        isNewCv = true;
      } else {
        // Vérifier les paramètres d'URL comme fallback
        const params = new URLSearchParams(location.search);
        const cvIdParam = params.get("cvId");
        if (cvIdParam) {
          cvIdToLoad = cvIdParam;
          console.log("CV ID trouvé dans l'URL:", cvIdToLoad);
        } else {
          // Par défaut, considérer comme un nouveau CV si aucune info n'est fournie
          console.log("Aucun CV à charger, création d'un nouveau CV");
          isNewCv = true;
        }
      }
      
      if (cvIdToLoad) {
        console.log("Chargement du CV:", cvIdToLoad);
        setCurrentCVId(cvIdToLoad);
        loadSavedCV(cvIdToLoad);
      } else if (isNewCv) {
        console.log("Initialisation d'un nouveau CV");
        resetCV();
        
        // Appliquer le thème du template si spécifié
        if (templateId && templateId !== 'classic') {
          console.log("Application du thème:", templateId);
          // Corrected: Create a proper CVTheme object instead of passing templateId string directly
          const themeToApply: CVTheme = {
            titleFont: 'roboto',
            textFont: 'roboto',
            primaryColor: '#0170c4',
            backgroundColor: '#ffffff',
            photoPosition: 'top',
            photoSize: 'medium',
            titleStyle: 'plain'
          };
          setInitialTheme(themeToApply);
        }
      }
      
      initialized.current = true;
    } catch (error) {
      console.error("Erreur lors du chargement initial du CV:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger ou créer le CV",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [location, loadSavedCV, resetCV, navigate, setInitialTheme, templateId, toast]);

  return {
    currentCVId,
    lastSaved,
    freeDownloadAvailable,
    isLoading,
    // Fixed: Properly handle arguments without using spread operator incorrectly
    handleSaveCV: (isAutoSave?: boolean) => handleSaveCV(currentCVId, setCurrentCVId, setLastSaved, isAutoSave),
    handleResetCV,
    handleBackToDashboard,
    handleDownloadCV: (format: "pdf" | "word" = "pdf") => handleDownloadCV(format, currentCVId, setFreeDownloadAvailable),
    previewResetKey,
    refreshPreview,
    setFreeDownloadAvailable,
  };
}
