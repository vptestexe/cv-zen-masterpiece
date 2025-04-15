
import { Button } from "@/components/ui/button";
import { useCVContext } from "@/contexts/CVContext";
import { CVEditor } from "@/components/editor/CVEditor";
import { CVPreview } from "@/components/preview/CVPreview";
import { ThemePalette } from "@/components/ThemePalette";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

const Index = () => {
  const { resetCV } = useCVContext();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");

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

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto py-4 px-4 sm:px-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">CV Zen <span className="font-playfair">Masterpiece</span></h1>
          <div className="flex gap-2">
            {isMobile && (
              <div className="flex rounded-lg overflow-hidden border">
                <Button
                  variant={activeTab === "editor" ? "default" : "ghost"}
                  className="rounded-none border-0"
                  onClick={() => setActiveTab("editor")}
                >
                  Éditeur
                </Button>
                <Button
                  variant={activeTab === "preview" ? "default" : "ghost"}
                  className="rounded-none border-0"
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
          <CVPreview />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-4 px-6">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} CV Zen Masterpiece - Un créateur de CV simple et élégant
          </p>
          <div className="flex gap-3">
            <Button onClick={handleSaveCV} className="gap-2">
              <Save className="h-4 w-4" />
              Sauvegarder
            </Button>
            <Button variant="outline" onClick={handleResetCV} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Réinitialiser
            </Button>
          </div>
        </div>
      </footer>

      {/* Theme Customizer Palette */}
      <ThemePalette />
    </div>
  );
};

export default Index;
