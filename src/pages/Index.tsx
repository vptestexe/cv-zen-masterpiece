import { Button } from "@/components/ui/button";
import { useCVContext } from "@/contexts/CVContext";
import { CVEditor } from "@/components/editor/CVEditor";
import { CVPreview } from "@/components/preview/CVPreview";
import { ThemePalette } from "@/components/ThemePalette";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw, ChevronUp, ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { v4 as uuidv4 } from 'uuid';

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
  const previewRef = useRef<HTMLDivElement>(null);
  
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
        
        if (savedCV && savedCV.theme) {
          console.log("Loading saved theme:", savedCV.theme);
          setInitialTheme(savedCV.theme);
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

  const handleSaveCV = () => {
    if (!cvData.personalInfo.fullName) {
      if (!isMobile) {
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
        
        if (!isMobile) {
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
        
        if (!isMobile) {
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
      
      if (!isMobile) {
        toast({
          title: "CV sauvegardé",
          description: "Votre CV a été sauvegardé avec succès.",
        });
      }
      console.log("Created brand new CV:", newCV);
    }
    
    localStorage.setItem('saved_cvs', JSON.stringify(savedCVs));
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
    }
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleDownloadCV = async () => {
    if (!previewRef.current) return;
    
    if (!isMobile) {
      toast({
        title: "Préparation du téléchargement",
        description: "Veuillez patienter pendant la création du PDF..."
      });
    }
    
    try {
      const previewElement = previewRef.current;
      
      const canvas = await html2canvas(previewElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff"
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save('mon-cv.pdf');
      
      if (!isMobile) {
        toast({
          title: "CV téléchargé",
          description: "Votre CV a été téléchargé avec succès au format PDF."
        });
      }
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

      <main className="flex-1 container mx-auto flex flex-col md:flex-row gap-6 p-4 sm:p-6">
        <div 
          className={`w-full md:w-1/2 rounded-lg shadow-sm overflow-hidden transition-all duration-300 ${
            isMobile && activeTab !== "editor" ? "hidden" : "block"
          }`}
        >
          <CVEditor />
        </div>

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

      <footer className="bg-white border-t py-4 px-4 sm:px-6 sticky bottom-0 z-10">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
            © {new Date().getFullYear()} CV Zen Masterpiece - Un créateur de CV simple et élégant
          </p>
          <div className="flex gap-2 sm:gap-3">
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

      {scrolled && (
        <button 
          onClick={scrollToTop} 
          className="fixed bottom-20 right-4 z-50 p-2 bg-primary text-white rounded-full shadow-lg animate-fade-in"
          aria-label="Retour en haut"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}

      <ThemePalette />
    </div>
  );
};

export default Index;
