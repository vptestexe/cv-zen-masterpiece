import { Button } from "@/components/ui/button";
import { useCVContext } from "@/contexts/CVContext";
import { CVEditor } from "@/components/editor/CVEditor";
import { CVPreview } from "@/components/preview/CVPreview";
import { ThemePalette } from "@/components/ThemePalette";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw, ChevronUp, ArrowLeft, Eye, EyeOff, AlertTriangle, Download, FileText } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { v4 as uuidv4 } from 'uuid';
import { getDownloadCount, isFreeDownloadAvailable, PAYMENT_AMOUNT } from "@/utils/downloadManager";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const MAX_AUTO_SAVE_INTERVAL = 30000; // 30 secondes

const Index = () => {
  const { resetCV, cvData, cvTheme, setInitialTheme } = useCVContext();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { templateId } = useParams<{ templateId?: string }>();
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [scrolled, setScrolled] = useState(false);
  const [currentCVId, setCurrentCVId] = useState<string | null>(null);
  const [previewActive, setPreviewActive] = useState(!isMobile);
  const [showPreviewInfo, setShowPreviewInfo] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
      console.log("CV ID from state:", stateWithId.cvId);
    } else {
      const params = new URLSearchParams(location.search);
      const cvId = params.get('cvId');
      if (cvId) {
        setCurrentCVId(cvId);
        loadSavedCV(cvId);
        console.log("CV ID from URL:", cvId);
      }
    }
  }, [location]);

  const loadSavedCV = (cvId: string) => {
    try {
      const savedCVsJSON = localStorage.getItem('saved_cvs');
      if (savedCVsJSON) {
        const savedCVs = JSON.parse(savedCVsJSON);
        const savedCV = savedCVs.find((cv: any) => cv.id === cvId);
        
        if (savedCV) {
          console.log("Loading saved CV data:", savedCV);
          
          if (savedCV.data) {
            Object.entries(savedCV.data).forEach(([key, value]) => {
              if (key === 'personalInfo') {
                Object.entries(value as Record<string, any>).forEach(([infoKey, infoValue]) => {
                  console.log(`Setting ${infoKey} to:`, infoValue);
                });
              }
            });
          }
          
          if (savedCV.theme) {
            console.log("Loading saved theme:", savedCV.theme);
            setInitialTheme(savedCV.theme);
          }
          
          refreshPreview();
        }
      }
    } catch (error) {
      console.error("Error loading saved CV:", error);
    }
  };

  useEffect(() => {
    const authToken = localStorage.getItem('auth_token');
    
    if (!authToken) {
      if (!isMobile) {
        toast({
          title: "Connexion requise",
          description: "Veuillez vous connecter pour créer ou modifier un CV",
          variant: "destructive"
        });
      }
      navigate("/login");
    }
  }, [navigate, toast, isMobile]);

  useEffect(() => {
    console.log("Current theme in Index:", cvTheme);
  }, [cvTheme]);

  useEffect(() => {
    const setupAutoSave = () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        if (cvData.personalInfo.fullName) {
          handleSaveCV(true);
        }
        setupAutoSave();
      }, MAX_AUTO_SAVE_INTERVAL);
    };
    
    setupAutoSave();
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [cvData]);

  const handleSaveCV = (isAutoSave = false) => {
    if (!cvData.personalInfo.fullName) {
      if (!isMobile && !isAutoSave) {
        toast({
          title: "Informations incomplètes",
          description: "Veuillez au moins renseigner votre nom complet",
          variant: "destructive"
        });
      }
      return;
    }

    const savedCVsJSON = localStorage.getItem('saved_cvs');
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
          theme: cvTheme
        };
        
        if (!isMobile && !isAutoSave) {
          toast({
            title: "CV mis à jour",
            description: "Votre CV a été mis à jour avec succès.",
          });
        }
        console.log("Updated CV:", savedCVs[cvIndex]);
      } else {
        const newCV = {
          id: currentCVId,
          title: cvTitle,
          template: templateId || "classic",
          lastUpdated: new Date().toISOString(),
          data: cvData,
          theme: cvTheme
        };
        
        savedCVs.push(newCV);
        
        if (!isMobile && !isAutoSave) {
          toast({
            title: "CV créé",
            description: "Un nouveau CV a été créé car celui en cours de modification n'existe plus.",
          });
        }
        console.log("Created new CV with existing ID:", newCV);
      }
    } else {
      const newCVId = uuidv4();
      const newCV = {
        id: newCVId,
        title: cvTitle,
        template: templateId || "classic",
        lastUpdated: new Date().toISOString(),
        data: cvData,
        theme: cvTheme
      };
      
      savedCVs.push(newCV);
      setCurrentCVId(newCVId);
      
      if (!isMobile && !isAutoSave) {
        toast({
          title: "CV sauvegardé",
          description: "Votre CV a été sauvegardé avec succès.",
        });
      }
      console.log("Created brand new CV:", newCV);
    }
    
    localStorage.setItem('saved_cvs', JSON.stringify(savedCVs));
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
          description: "Votre CV a été réinitialisé avec succès."
        });
      }
      
      refreshPreview();
    }
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleDownloadCV = async (format: 'pdf' | 'word' = 'pdf') => {
    if (!previewRef.current) return;
    
    if (currentCVId && !isFreeDownloadAvailable(currentCVId)) {
      toast({
        title: "Téléchargement impossible",
        description: `Veuillez acheter des téléchargements pour ce CV (${PAYMENT_AMOUNT} CFA)`,
        variant: "destructive"
      });
      navigate("/dashboard");
      return;
    }
    
    if (!isMobile) {
      toast({
        title: "Préparation du téléchargement",
        description: `Veuillez patienter pendant la création du ${format === 'pdf' ? 'PDF' : 'document Word'}...`
      });
    }
    
    try {
      const savedCVsJSON = localStorage.getItem('saved_cvs');
      if (!savedCVsJSON || !currentCVId) {
        throw new Error("CV data not found");
      }
      
      const savedCVs = JSON.parse(savedCVsJSON);
      const currentCV = savedCVs.find((cv: any) => cv.id === currentCVId);
      
      if (!currentCV) {
        throw new Error("Current CV not found");
      }
      
      const downloadId = uuidv4().substring(0, 8).toUpperCase();
      
      if (format === 'pdf') {
        await downloadCvAsPdf(currentCV, downloadId);
      } else {
        downloadCvAsWord(currentCV, downloadId);
      }
      
      if (!isMobile) {
        toast({
          title: "CV téléchargé",
          description: `Votre CV a été téléchargé avec succès au format ${format === 'pdf' ? 'PDF' : 'Word'}.`
        });
      }
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      
      if (!isMobile) {
        toast({
          title: "Erreur de téléchargement",
          description: "Une erreur est survenue lors du téléchargement de votre CV.",
          variant: "destructive"
        });
      }
    }
  };

  const refreshPreview = useCallback(() => {
    setPreviewResetKey(prev => prev + 1);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatLastSaved = () => {
    if (!lastSaved) return null;
    
    return lastSaved.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const togglePreview = () => {
    if (isMobile) {
      setActiveTab(activeTab === "editor" ? "preview" : "editor");
    } else {
      setPreviewActive(!previewActive);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="container mx-auto py-4 px-4 sm:px-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBackToDashboard} 
              className="rounded-full"
              aria-label="Retour au tableau de bord"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-primary truncate">CV Zen <span className="font-playfair">Masterpiece</span></h1>
          </div>
          <div className="flex gap-2">
            {isMobile && (
              <div className="flex rounded-lg overflow-hidden border">
                <Button
                  variant={activeTab === "editor" ? "default" : "ghost"}
                  className="rounded-none border-0 px-2 sm:px-3"
                  onClick={() => setActiveTab("editor")}
                >
                  Éditeur
                </Button>
                <Button
                  variant={activeTab === "preview" ? "default" : "ghost"}
                  className="rounded-none border-0 px-2 sm:px-3"
                  onClick={() => setActiveTab("preview")}
                >
                  Aperçu
                </Button>
              </div>
            )}
            {!isMobile && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={togglePreview}
                className="flex items-center gap-1"
              >
                {previewActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {previewActive ? "Masquer l'aperçu" : "Afficher l'aperçu"}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto flex flex-col md:flex-row gap-6 p-4 sm:p-6">
        <div 
          className={`w-full ${previewActive ? "md:w-1/2" : "md:w-full"} rounded-lg shadow-sm overflow-hidden transition-all duration-300 ${
            isMobile && activeTab !== "editor" ? "hidden" : "block"
          }`}
        >
          <CVEditor />
          
          {lastSaved && (
            <div className="bg-white border-t p-2 text-xs text-muted-foreground text-center flex items-center justify-center">
              <RefreshCw className="h-3 w-3 mr-1 text-green-500" />
              Dernière sauvegarde à {formatLastSaved()}
            </div>
          )}
        </div>

        {(!isMobile && previewActive || isMobile && activeTab === "preview") && (
          <div className="w-full md:w-1/2 rounded-lg shadow-sm overflow-hidden transition-all duration-300">
            {!freeDownloadAvailable && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Vous n'aurez pas de téléchargements gratuits pour ce CV. Un paiement de {PAYMENT_AMOUNT} CFA sera requis.
                </AlertDescription>
              </Alert>
            )}
            
            <div 
              className="bg-white p-4 sm:p-6 shadow-sm rounded-lg"
              ref={previewRef}
              key={`preview-container-${previewResetKey}`}
            >
              <CVPreview />
            </div>
            
            <div className="bg-white border-t p-2 text-xs flex justify-center">
              <Button variant="link" size="sm" onClick={() => setShowPreviewInfo(true)}>
                Comment améliorer mon aperçu ?
              </Button>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t py-4 px-4 sm:px-6 sticky bottom-0 z-10">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button onClick={handleBackToDashboard} variant="outline" className="gap-1 sm:gap-2 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            Retour
          </Button>
          
          <div className="flex gap-2 sm:gap-3">
            <Button onClick={() => handleSaveCV()} className="gap-1 sm:gap-2 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
              <Save className="h-3 w-3 sm:h-4 sm:w-4" />
              Sauvegarder
            </Button>
            <Button variant="outline" onClick={handleResetCV} className="gap-1 sm:gap-2 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
              Réinitialiser
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="default" 
                  className="gap-1 sm:gap-2 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm"
                  disabled={!freeDownloadAvailable}
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                  Télécharger
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleDownloadCV('pdf')} disabled={!freeDownloadAvailable}>
                  <Download className="h-4 w-4 mr-2" />
                  Format PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadCV('word')} disabled={!freeDownloadAvailable}>
                  <FileText className="h-4 w-4 mr-2" />
                  Format Word
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </footer>

      {scrolled && (
        <button 
          onClick={scrollToTop} 
          className="fixed bottom-20 right-4 z-50 p-2 bg-primary text-white rounded-full shadow-lg animate-fade-in"
          aria-label="Retour en haut"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}

      <Dialog open={showPreviewInfo} onOpenChange={setShowPreviewInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conseils pour l'aperçu</DialogTitle>
            <DialogDescription>
              Pour améliorer la qualité de l'aperçu de votre CV, voici quelques conseils :
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">1. Si l'aperçu n'est pas à jour :</h3>
              <p className="text-muted-foreground text-sm">
                Cliquez sur "Sauvegarder" pour rafraîchir l'aperçu avec vos dernières modifications.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">2. Pour les photos de profil :</h3>
              <p className="text-muted-foreground text-sm">
                Utilisez les outils d'ajustement de photo pour obtenir le cadrage parfait.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">3. Téléchargement :</h3>
              <p className="text-muted-foreground text-sm">
                Le CV téléchargé peut légèrement différer de l'aperçu à l'écran, mais conservera toutes vos informations.
              </p>
            </div>
            <Button onClick={() => setShowPreviewInfo(false)} className="w-full">J'ai compris</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ThemePalette />
    </div>
  );
};

export default Index;
