
import { useToast } from "@/hooks/use-toast";
import { isFreeDownloadAvailable, PAYMENT_AMOUNT } from "@/utils/downloadManager";
import { downloadCvAsPdf, downloadCvAsWord } from "@/utils/download";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useIsMobile } from "@/hooks/use-mobile";

// Download hook with business logic isolated
export function useCVDownload({ getCurrentCV, refreshPreview }: {
  getCurrentCV: () => any, // () => currentCV object (with id)
  refreshPreview: () => void,
}) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleDownloadCV = async (format: "pdf" | "word", currentCVId: string | null, setFreeDownloadAvailable: (b: boolean) => void) => {
    if (currentCVId && !isFreeDownloadAvailable(currentCVId)) {
      toast({
        title: "Téléchargement impossible",
        description: `Veuillez acheter des téléchargements pour ce CV (${PAYMENT_AMOUNT} CFA)`,
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    if (!isMobile) {
      toast({
        title: "Préparation du téléchargement",
        description: `Veuillez patienter pendant la création du ${format === "pdf" ? "PDF" : "document Word"}...`,
      });
    }

    try {
      const currentCV = getCurrentCV();
      if (!currentCV) {
        throw new Error("Current CV not found");
      }
      const downloadId = uuidv4().substring(0, 8).toUpperCase();

      if (format === "pdf") {
        await downloadCvAsPdf(currentCV, downloadId);
      } else {
        downloadCvAsWord(currentCV, downloadId);
      }

      if (!isMobile) {
        toast({
          title: "CV téléchargé",
          description: `Votre CV a été téléchargé avec succès au format ${format === "pdf" ? "PDF" : "Word"}.`,
        });
      }
      setFreeDownloadAvailable(isFreeDownloadAvailable(currentCVId!));
      navigate("/dashboard");
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      if (!isMobile) {
        toast({
          title: "Erreur de téléchargement",
          description: "Une erreur est survenue lors du téléchargement de votre CV.",
          variant: "destructive",
        });
      }
    }
  };

  return { handleDownloadCV };
}
