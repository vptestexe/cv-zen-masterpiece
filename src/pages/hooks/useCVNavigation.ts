
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

export function useCVNavigation({ resetCV, refreshPreview }: {
  resetCV: () => void,
  refreshPreview: () => void,
}) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleResetCV = () => {
    if (confirm("Êtes-vous sûr de vouloir réinitialiser votre CV ? Toutes les données saisies seront perdues.")) {
      resetCV();
      if (!isMobile) {
        toast({
          title: "CV réinitialisé",
          description: "Votre CV a été réinitialisé avec succès.",
        });
      }
      refreshPreview();
    }
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return { handleResetCV, handleBackToDashboard };
}
