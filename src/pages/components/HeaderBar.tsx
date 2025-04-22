
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import React from "react";

interface HeaderBarProps {
  isMobile: boolean;
  activeTab: "editor" | "preview";
  setActiveTab: (tab: "editor" | "preview") => void;
  previewActive: boolean;
  togglePreview: () => void;
  onBack: () => void;
}

export const HeaderBar = ({
  isMobile,
  activeTab,
  setActiveTab,
  previewActive,
  togglePreview,
  onBack
}: HeaderBarProps) => (
  <header className="bg-white border-b sticky top-0 z-20">
    <div className="container mx-auto py-4 px-4 sm:px-6 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack} 
          className="rounded-full"
          aria-label="Retour au tableau de bord"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold text-primary truncate">
          CV Zen <span className="font-playfair">Masterpiece</span>
        </h1>
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
);
