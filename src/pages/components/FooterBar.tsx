
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, RefreshCw, Download, FileText } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import React from "react";
import { PAYMENT_AMOUNT } from "@/utils/downloadManager";

interface FooterBarProps {
  onBack: () => void;
  onSave: () => void;
  onReset: () => void;
  onDownloadPdf: () => void;
  onDownloadWord: () => void;
  freeDownloadAvailable: boolean;
}

export const FooterBar = ({
  onBack,
  onSave,
  onReset,
  onDownloadPdf,
  onDownloadWord,
  freeDownloadAvailable
}: FooterBarProps) => (
  <footer className="bg-white border-t py-4 px-4 sm:px-6 sticky bottom-0 z-10">
    <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
      <Button onClick={onBack} variant="outline" className="gap-1 sm:gap-2 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
        <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
        Retour
      </Button>
      <div className="flex gap-2 sm:gap-3">
        <Button onClick={onSave} className="gap-1 sm:gap-2 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
          <Save className="h-3 w-3 sm:h-4 sm:w-4" />
          Sauvegarder
        </Button>
        <Button variant="outline" onClick={onReset} className="gap-1 sm:gap-2 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
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
            <DropdownMenuItem onClick={onDownloadPdf} disabled={!freeDownloadAvailable}>
              <Download className="h-4 w-4 mr-2" />
              Format PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDownloadWord} disabled={!freeDownloadAvailable}>
              <FileText className="h-4 w-4 mr-2" />
              Format Word
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </footer>
);
