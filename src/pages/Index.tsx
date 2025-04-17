
import { Button } from "@/components/ui/button";
import { useCVContext } from "@/contexts/CVContext";
import { CVEditor } from "@/components/editor/CVEditor";
import { CVPreview } from "@/components/preview/CVPreview";
import { ThemePalette } from "@/components/ThemePalette";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw, ChevronUp, ArrowLeft, Download } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Index = () => {
  const { resetCV } = useCVContext();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [scrolled, setScrolled] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleSaveCV = () => {
    // In a real application, this would save to a server
    toast({
      title: "CV sauvegardé",
      description: "Votre CV a été sauvegardé avec succès.",
    });
  };

  const handleResetCV = () => {
    if (confirm("Êtes-vous sûr de vouloir réinitialiser votre CV ? Toutes les données saisies seront perdues.")) {
      resetCV();
      toast({
        title: "CV réinitialisé",
        description: "Votre CV a été réinitialisé avec succès."
      });
    }
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleDownloadCV = async () => {
    if (!previewRef.current) return;
    
    toast({
      title: "Préparation du téléchargement",
      description: "Veuillez patienter pendant la création du PDF..."
    });
    
    try {
      const previewElement = previewRef.current;
      
      const canvas = await html2canvas(previewElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff"
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      // A4 dimensions in mm (210 x 297)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save('mon-cv.pdf');
      
      toast({
        title: "CV téléchargé",
        description: "Votre CV a été téléchargé avec succès au format PDF."
      });
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast({
        title: "Erreur de téléchargement",
        description: "Une erreur est survenue lors du téléchargement de votre CV.",
        variant: "destructive"
      });
    }
  };

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

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
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
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto flex flex-col md:flex-row gap-6 p-4 sm:p-6">
        {/* Editor Panel */}
        <div 
          className={`w-full md:w-1/2 rounded-lg shadow-sm overflow-hidden transition-all duration-300 ${
            isMobile && activeTab !== "editor" ? "hidden" : "block"
          }`}
        >
          <CVEditor />
        </div>

        {/* Preview Panel */}
        <div 
          className={`w-full md:w-1/2 rounded-lg shadow-sm overflow-hidden transition-all duration-300 ${
            isMobile && activeTab !== "preview" ? "hidden" : "block"
          }`}
          ref={previewRef}
        >
          <CVPreview />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-4 px-4 sm:px-6 sticky bottom-0 z-10">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
            © {new Date().getFullYear()} CV Zen Masterpiece - Un créateur de CV simple et élégant
          </p>
          <div className="flex gap-2 sm:gap-3">
            <Button onClick={handleDownloadCV} className="gap-1 sm:gap-2 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              Télécharger
            </Button>
            <Button onClick={handleSaveCV} className="gap-1 sm:gap-2 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
              <Save className="h-3 w-3 sm:h-4 sm:w-4" />
              Sauvegarder
            </Button>
            <Button variant="outline" onClick={handleResetCV} className="gap-1 sm:gap-2 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
              Réinitialiser
            </Button>
          </div>
        </div>
      </footer>

      {/* Scroll to top button */}
      {scrolled && (
        <button 
          onClick={scrollToTop} 
          className="fixed bottom-20 right-4 z-50 p-2 bg-primary text-white rounded-full shadow-lg animate-fade-in"
          aria-label="Retour en haut"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}

      {/* Theme Customizer Palette */}
      <ThemePalette />
    </div>
  );
};

export default Index;
