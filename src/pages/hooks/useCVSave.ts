
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { useIsMobile } from "@/hooks/use-mobile";

export function useCVSave({ cvData, cvTheme, templateId, setInitialTheme, refreshPreview }: {
  cvData: any,
  cvTheme: any,
  templateId?: string,
  setInitialTheme: (theme: any) => void,
  refreshPreview: () => void,
}) {
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleSaveCV = (currentCVId: string | null, setCurrentCVId: (id: string) => void, setLastSaved: (date: Date) => void, isAutoSave = false) => {
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

    const currentTime = new Date();
    
    if (currentCVId) {
      const cvIndex = savedCVs.findIndex((cv: any) => cv.id === currentCVId);
      if (cvIndex !== -1) {
        savedCVs[cvIndex] = {
          ...savedCVs[cvIndex],
          title: cvTitle,
          template: templateId || savedCVs[cvIndex].template || "classic",
          lastUpdated: currentTime.toISOString(),
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
          lastUpdated: currentTime.toISOString(),
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
        lastUpdated: currentTime.toISOString(),
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
    setLastSaved(currentTime);
    refreshPreview();
  };

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

  return { handleSaveCV, loadSavedCV };
}
