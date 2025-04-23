
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
import { downloadCvAsPdf, downloadCvAsWord } from "@/utils/download";
import { useCVEditorActions } from "./hooks/useCVEditorActions";
import { HeaderBar } from "./components/HeaderBar";
import { FooterBar } from "./components/FooterBar";
import { PreviewInfoDialog } from "./components/PreviewInfoDialog";
import { ScrollToTopButton } from "./components/ScrollToTopButton";

const MAX_AUTO_SAVE_INTERVAL = 30000; // 30 secondes

const Index = () => {
  // UI/Editor state
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [scrolled, setScrolled] = useState(false);
  const [previewActive, setPreviewActive] = useState(!useIsMobile());
  const [showPreviewInfo, setShowPreviewInfo] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Actions and logic refactored to custom hook
  const {
    lastSaved,
    freeDownloadAvailable,
    handleSaveCV,
    handleResetCV,
    handleBackToDashboard,
    handleDownloadCV,
    previewResetKey,
    refreshPreview,
  } = useCVEditorActions();

  const { cvData } = useCVContext();

  // Vérifier l'authentification dès que possible
  useEffect(() => {
    const checkAuth = () => {
      try {
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
          return false;
        }
        return true;
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
        return false;
      }
    };

    const isAuth = checkAuth();
    if (isAuth) {
      setIsPageLoaded(true);
    }
  }, [navigate, toast, isMobile]);

  // Configuration de sauvegarde automatique
  useEffect(() => {
    if (!isPageLoaded) return;

    const autoSaveTimeoutRef = setTimeout(() => {
      if (cvData?.personalInfo?.fullName) {
        handleSaveCV(true);
      }
    }, MAX_AUTO_SAVE_INTERVAL);
    
    return () => {
      clearTimeout(autoSaveTimeoutRef);
    };
  }, [cvData, handleSaveCV, isPageLoaded]);

  // Gestion du défilement
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const formatLastSaved = () => {
    if (!lastSaved) return null;
    return lastSaved.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const togglePreview = () => {
    if (isMobile) {
      setActiveTab(activeTab === "editor" ? "preview" : "editor");
    } else {
      setPreviewActive(!previewActive);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Si la page n'est pas encore chargée ou l'authentification est en cours
  if (!isPageLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <HeaderBar
        isMobile={isMobile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        previewActive={previewActive}
        togglePreview={togglePreview}
        onBack={handleBackToDashboard}
      />
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

      <FooterBar
        onBack={handleBackToDashboard}
        onSave={handleSaveCV}
        onReset={handleResetCV}
        onDownloadPdf={() => handleDownloadCV("pdf")}
        onDownloadWord={() => handleDownloadCV("word")}
        freeDownloadAvailable={freeDownloadAvailable}
      />

      <ScrollToTopButton scrolled={scrolled} onClick={scrollToTop} />

      <PreviewInfoDialog open={showPreviewInfo} onOpenChange={setShowPreviewInfo} />

      <ThemePalette />
    </div>
  );
};

export default Index;
