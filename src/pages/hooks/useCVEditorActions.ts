
import { useCVContext } from "@/contexts/CVContext";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useCallback, useState, useRef, useEffect } from "react";
import { getDownloadCount, isFreeDownloadAvailable, PAYMENT_AMOUNT } from "@/utils/downloadManager";
import { v4 as uuidv4 } from "uuid";
import { downloadCvAsPdf, downloadCvAsWord } from "@/components/dashboard/DownloadManager";

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

  const loadSavedCV = (cvId: string) => {
    try {
      const savedCVsJSON = localStorage.getItem("saved_cvs");
      if (savedCVsJSON) {
        const savedCVs = JSON.parse(savedCVsJSON);
        const savedCV = savedCVs.find((cv: any) => cv.id === cvId);
        if (savedCV && savedCV.theme) {
          setInitialTheme(savedCV.theme);
        }
        refreshPreview();
      }
    } catch (error) {
      console.error("Error loading saved CV:", error);
    }
  };

  const handleSaveCV = (isAutoSave = false) => {
    if (!cvData.personalInfo.fullName) {
      if (!isMobile && !isAutoSave) {
        toast({
          title: "Informations incomplètes",
          description: "Veuillez au moins renseigner votre nom complet",
          variant: "destructive",
        });
      }
      return;
    }

    const savedCVsJSON = localStorage.getItem("saved_cvs");
    let savedCVs = [];

    if (savedCVsJSON) {
      try {
        savedCVs = JSON.parse(savedCVsJSON);
      } catch (e) {
        console.error("Erreur lors de la récupération des CV:", e);
      }
    }

    const cvTitle = cvData.personalInfo.jobTitle
      ? `${cvData.personalInfo.fullName} - ${cvData.personalInfo.jobTitle}`
      : `CV de ${cvData.personalInfo.fullName}`;

    if (currentCVId) {
      const cvIndex = savedCVs.findIndex((cv: any) => cv.id === currentCVId);
      if (cvIndex !== -1) {
        savedCVs[cvIndex] = {
          ...savedCVs[cvIndex],
          title: cvTitle,
          template: templateId || savedCVs[cvIndex].template || "classic",
          lastUpdated: new Date().toISOString(),
          data: cvData,
          theme: cvTheme,
        };
        if (!isMobile && !isAutoSave) {
          toast({
            title: "CV mis à jour",
            description: "Votre CV a été mis à jour avec succès.",
          });
        }
      } else {
        const newCV = {
          id: currentCVId,
          title: cvTitle,
          template: templateId || "classic",
          lastUpdated: new Date().toISOString(),
          data: cvData,
          theme: cvTheme,
        };
        savedCVs.push(newCV);
        if (!isMobile && !isAutoSave) {
          toast({
            title: "CV créé",
            description: "Un nouveau CV a été créé car celui en cours de modification n'existe plus.",
          });
        }
      }
    } else {
      const newCVId = uuidv4();
      const newCV = {
        id: newCVId,
        title: cvTitle,
        template: templateId || "classic",
        lastUpdated: new Date().toISOString(),
        data: cvData,
        theme: cvTheme,
      };
      savedCVs.push(newCV);
      setCurrentCVId(newCVId);
      if (!isMobile && !isAutoSave) {
        toast({
          title: "CV sauvegardé",
          description: "Votre CV a été sauvegardé avec succès.",
        });
      }
    }

    localStorage.setItem("saved_cvs", JSON.stringify(savedCVs));
    setLastSaved(new Date());

    refreshPreview();
  };

  const handleResetCV = () => {
    if (confirm("Êtes-vous sûr de vouloir réinitialiser votre CV ? Toutes les données saisies seront perdues.")) {
      resetCV();
      setCurrentCVId(null);
      if (!isMobile) {
        toast({
          title: "CV réinitialisé",
          description: "Votre CV a été réinitialisé avec succès.",
        });
      }
      refreshPreview();
    }
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleDownloadCV = async (format: "pdf" | "word" = "pdf") => {
    if (currentCVId && !isFreeDownloadAvailable(currentCVId)) {
      toast({
        title: "Téléchargement impossible",
        description: `Veuillez acheter des téléchargements pour ce CV (${PAYMENT_AMOUNT} CFA)`,
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    if (!isMobile) {
      toast({
        title: "Préparation du téléchargement",
        description: `Veuillez patienter pendant la création du ${format === "pdf" ? "PDF" : "document Word"}...`,
      });
    }

    try {
      const savedCVsJSON = localStorage.getItem("saved_cvs");
      if (!savedCVsJSON || !currentCVId) {
        throw new Error("CV data not found");
      }

      const savedCVs = JSON.parse(savedCVsJSON);
      const currentCV = savedCVs.find((cv: any) => cv.id === currentCVId);
      if (!currentCV) {
        throw new Error("Current CV not found");
      }
      const downloadId = uuidv4().substring(0, 8).toUpperCase();

      if (format === "pdf") {
        await downloadCvAsPdf(currentCV, downloadId);
      } else {
        downloadCvAsWord(currentCV, downloadId);
      }

      if (!isMobile) {
        toast({
          title: "CV téléchargé",
          description: `Votre CV a été téléchargé avec succès au format ${format === "pdf" ? "PDF" : "Word"}.`,
        });
      }
      navigate("/dashboard");
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      if (!isMobile) {
        toast({
          title: "Erreur de téléchargement",
          description: "Une erreur est survenue lors du téléchargement de votre CV.",
          variant: "destructive",
        });
      }
    }
  };

  const refreshPreview = useCallback(() => {
    setPreviewResetKey((prev) => prev + 1);
  }, []);

  return {
    currentCVId,
    lastSaved,
    freeDownloadAvailable,
    handleSaveCV,
    handleResetCV,
    handleBackToDashboard,
    handleDownloadCV,
    previewResetKey,
    refreshPreview,
    setFreeDownloadAvailable,
  };
}
