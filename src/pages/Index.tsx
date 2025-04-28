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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCVEditorActions } from "./hooks/useCVEditorActions";
import { HeaderBar } from "./components/HeaderBar";
import { FooterBar } from "./components/FooterBar";
import { PreviewInfoDialog } from "./components/PreviewInfoDialog";
import { ScrollToTopButton } from "./components/ScrollToTopButton";
import AdBanner from "@/components/ads/AdBanner";
import { useAds } from "@/components/ads/AdProvider";

const MAX_AUTO_SAVE_INTERVAL = 30000; // 30 secondes

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6"></div>
      <p className="text-xl font-semibold text-gray-700">Chargement du CV...</p>
      <p className="text-sm text-gray-500 mt-2">Veuillez patienter un instant</p>
    </div>
  </div>
);

const ErrorScreen = ({ message, onRetry }: { message: string, onRetry: () => void }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-gray-800 mb-3">Une erreur est survenue</h2>
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex gap-4 justify-center">
        <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>
          Retour au tableau de bord
        </Button>
        <Button onClick={onRetry}>Réessayer</Button>
      </div>
    </div>
  </div>
);

const Index = () => {
  // UI/Editor state
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [scrolled, setScrolled] = useState(false);
  const [previewActive, setPreviewActive] = useState(!useIsMobile());
  const [showPreviewInfo, setShowPreviewInfo] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { adsEnabled } = useAds();

  // Actions and logic refactored to custom hook
  const {
    lastSaved,
    freeDownloadAvailable,
    isLoading,
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
          setAuthError("Veuillez vous connecter pour créer ou modifier un CV");
          
          if (!isMobile) {
            toast({
              title: "Connexion requise",
              description: "Veuillez vous connecter pour créer ou modifier un CV",
              variant: "destructive"
            });
          }
          
          // Délai court pour permettre l'affichage du toast avant la redirection
          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 100);
          
          return false;
        }
        return true;
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
        setAuthError("Erreur d'authentification. Veuillez vous reconnecter.");
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
    if (!isPageLoaded || isLoading) return;

    const autoSaveTimeoutRef = setTimeout(() => {
      if (cvData?.personalInfo?.fullName) {
        handleSaveCV(true);
      }
    }, MAX_AUTO_SAVE_INTERVAL);
    
    return () => {
      clearTimeout(autoSaveTimeoutRef);
    };
  }, [cvData, handleSaveCV, isPageLoaded, isLoading]);

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

  const handleRetry = () => {
    setAuthError(null);
    window.location.reload();
  };

  // Si une erreur d'authentification s'est produite
  if (authError) {
    return <ErrorScreen message={authError} onRetry={handleRetry} />;
  }

  // Si la page n'est pas encore chargée ou l'authentification est en cours
  if (!isPageLoaded || isLoading) {
    return <LoadingScreen />;
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
      
      {adsEnabled && (
        <div className="w-full flex justify-center py-2 bg-gray-50">
          <AdBanner size="banner" position="top" />
        </div>
      )}
      
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

      {adsEnabled && !isMobile && (
        <div className="fixed right-4 bottom-20 z-40">
          <AdBanner size="skyscraper" position="fixed" />
        </div>
      )}

      <FooterBar
        onBack={handleBackToDashboard}
        onSave={() => handleSaveCV(false)}
        onReset={handleResetCV}
        onDownloadPdf={() => handleDownloadCV("pdf")}
        onDownloadWord={() => handleDownloadCV("word")}
        freeDownloadAvailable={true}
      />

      <ScrollToTopButton scrolled={scrolled} onClick={scrollToTop} />

      <PreviewInfoDialog open={showPreviewInfo} onOpenChange={setShowPreviewInfo} />

      <ThemePalette />
      
      {adsEnabled && (
        <div className="w-full flex justify-center py-3 bg-gray-50 border-t">
          <AdBanner size="banner" position="bottom" />
        </div>
      )}
    </div>
  );
};

export default Index;
