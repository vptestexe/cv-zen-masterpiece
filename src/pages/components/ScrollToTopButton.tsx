
import { ChevronUp } from "lucide-react";
import React from "react";

interface ScrollToTopButtonProps {
  scrolled: boolean;
  onClick: () => void;
}

export const ScrollToTopButton = ({ scrolled, onClick }: ScrollToTopButtonProps) => {
  if (!scrolled) return null;
  return (
    <button 
      onClick={onClick} 
      className="fixed bottom-20 right-4 z-50 p-2 bg-primary text-white rounded-full shadow-lg animate-fade-in"
      aria-label="Retour en haut"
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
};
