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
import { downloadCvAsPdf, downloadCvAsWord } from "@/components/dashboard/DownloadManager";
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

  const isMobile = useIsMobile();
  const { cvData } = useCVContext();

  useEffect(() => {
    const authToken = localStorage.getItem('auth_token');
    
    if (!authToken) {
      if (!isMobile) {
        useToast().toast({
          title: "Connexion requise",
          description: "Veuillez vous connecter pour créer ou modifier un CV",
          variant: "destructive"
        });
      }
      useNavigate()("/login");
    }
  }, [useNavigate, useToast, isMobile]);

  useEffect(() => {
    const setupAutoSave = () => {
      const autoSaveTimeoutRef = { current: null as NodeJS.Timeout | null };
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
      const autoSaveTimeoutRef = { current: null as NodeJS.Timeout | null };
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [cvData, handleSaveCV]);
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
