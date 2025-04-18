
import { Button } from "@/components/ui/button";
import { useCVContext } from "@/contexts/CVContext";
import { CVEditor } from "@/components/editor/CVEditor";
import { CVPreview } from "@/components/preview/CVPreview";
import { ThemePalette } from "@/components/ThemePalette";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw, ChevronUp, ArrowLeft, Download } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { v4 as uuidv4 } from 'uuid';

const Index = () => {
  const { resetCV, cvData, cvTheme } = useCVContext();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { templateId } = useParams<{ templateId?: string }>();
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [scrolled, setScrolled] = useState(false);
  const [currentCVId, setCurrentCVId] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Get the current CV ID from the query parameters or state
  useEffect(() => {
    // Check if a CV ID was passed via location state
    const stateWithId = location.state as { cvId?: string } | null;
    if (stateWithId?.cvId) {
      setCurrentCVId(stateWithId.cvId);
      console.log("CV ID from state:", stateWithId.cvId);
    } else {
      // Extract from query params as a fallback
      const params = new URLSearchParams(location.search);
      const cvId = params.get('cvId');
      if (cvId) {
        setCurrentCVId(cvId);
        console.log("CV ID from URL:", cvId);
      }
    }
  }, [location]);

  // Vérifier l'authentification
  useEffect(() => {
    const authToken = localStorage.getItem('auth_token');
    
    if (!authToken) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour créer ou modifier un CV",
        variant: "destructive"
      });
      navigate("/login");
    }
  }, [navigate, toast]);

  // Log theme changes pour debugging
  useEffect(() => {
    console.log("Current theme in Index:", cvTheme);
  }, [cvTheme]);

  const handleSaveCV = () => {
    // Vérifier que le CV a au moins un nom
    if (!cvData.personalInfo.fullName) {
      toast({
        title: "Informations incomplètes",
        description: "Veuillez au moins renseigner votre nom complet",
        variant: "destructive"
      });
      return;
    }

    // Récupérer les CV existants
    const savedCVsJSON = localStorage.getItem('saved_cvs');
    let savedCVs = [];
    
    if (savedCVsJSON) {
      try {
        savedCVs = JSON.parse(savedCVsJSON);
      } catch (e) {
        console.error("Erreur lors de la récupération des CV:", e);
      }
    }
    
    // Créer un titre pour le CV
    const cvTitle = cvData.personalInfo.jobTitle 
      ? `${cvData.personalInfo.fullName} - ${cvData.personalInfo.jobTitle}` 
      : `CV de ${cvData.personalInfo.fullName}`;
      
    // Check if we're updating an existing CV or creating a new one
    if (currentCVId) {
      // Find and update existing CV
      const cvIndex = savedCVs.findIndex((cv: any) => cv.id === currentCVId);
      
      if (cvIndex !== -1) {
        // Update existing CV
        savedCVs[cvIndex] = {
          ...savedCVs[cvIndex],
          title: cvTitle,
          template: templateId || savedCVs[cvIndex].template || "classic",
          lastUpdated: new Date().toISOString(),
          data: cvData,
          theme: cvTheme // Sauvegarder aussi le thème
        };
        
        toast({
          title: "CV mis à jour",
          description: "Votre CV a été mis à jour avec succès.",
        });
        console.log("Updated CV:", savedCVs[cvIndex]);
      } else {
        // CV ID not found, create new one with the same ID
        const newCV = {
          id: currentCVId,
          title: cvTitle,
          template: templateId || "classic",
          lastUpdated: new Date().toISOString(),
          data: cvData,
          theme: cvTheme
        };
        savedCVs.push(newCV);
        
        toast({
          title: "CV créé",
          description: "Un nouveau CV a été créé car celui en cours de modification n'existe plus.",
        });
        console.log("Created new CV with existing ID:", newCV);
      }
    } else {
      // Create a new CV
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
      // Update the current CV ID to the new one
      setCurrentCVId(newCVId);
      
      toast({
        title: "CV sauvegardé",
        description: "Votre CV a été sauvegardé avec succès.",
      });
      console.log("Created brand new CV:", newCV);
    }
    
    // Sauvegarder dans le localStorage
    localStorage.setItem('saved_cvs', JSON.stringify(savedCVs));
  };

  const handleResetCV = () => {
    if (confirm("Êtes-vous sûr de vouloir réinitialiser votre CV ? Toutes les données saisies seront perdues.")) {
      resetCV();
      // Reset the current CV ID when resetting the CV
      setCurrentCVId(null);
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
        >
          <div ref={previewRef}>
            <CVPreview />
          </div>
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
