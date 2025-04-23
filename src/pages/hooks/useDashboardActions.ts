
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useInsertPayment } from "@/hooks/use-payments";
import { 
  updateDownloadCount, 
  getDownloadCount,
  hasDownloadsRemaining,
  canCreateNewCV,
  MAX_FREE_CVS,
  saveCVs,
  secureStorage,
  PAYMENT_AMOUNT
} from "@/utils/downloadManager";
import { downloadCvAsPdf, downloadCvAsWord } from "@/utils/download";
import { generateUniqueId } from "@/utils/generateUniqueId";

export function useDashboardActions(state: any) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate: insertPayment } = useInsertPayment();

  const handleEdit = (cvId: string) => {
    const cv = state.userCVs.find((cv: any) => cv.id === cvId);
    if (cv) {
      navigate(`/editor/${cv.template}`, { state: { cvId } });
      if (!state.isMobile) {
        toast({
          title: "Modification du CV",
          description: "Vous pouvez maintenant modifier votre CV"
        });
      }
    }
  };

  const handleDownload = async (cvId: string, format = "pdf") => {
    if (!hasDownloadsRemaining(cvId)) {
      state.setCurrentCvId(cvId);
      localStorage.setItem("cv_being_paid", cvId);
      state.setShowPaymentDialog(true);
      return;
    }

    try {
      const cv = state.userCVs.find((cv: any) => cv.id === cvId);
      if (!cv) {
        toast({
          title: "Erreur",
          description: "CV introuvable",
          variant: "destructive"
        });
        return;
      }

      const downloadId = generateUniqueId().substring(0, 8).toUpperCase();
      if (format === "pdf") await downloadCvAsPdf(cv, downloadId);
      else downloadCvAsWord(cv, downloadId);

      const updatedCount = updateDownloadCount(cvId);
      state.setDownloadCounts(prev => ({
        ...prev,
        [cvId]: updatedCount
      }));

      toast({
        title: "Téléchargement réussi",
        description: `Il vous reste ${updatedCount.count} téléchargements`
      });
    } catch (error) {
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible de générer le document",
        variant: "destructive"
      });
    }
  };

  const handleCreateNew = () => {
    if (!canCreateNewCV()) {
      toast({
        title: "Limite atteinte",
        description: `Vous avez atteint votre limite de ${MAX_FREE_CVS} CV gratuits. Veuillez supprimer un CV existant ou acheter des téléchargements supplémentaires.`,
        variant: "destructive"
      });
      return;
    }
    
    navigate("/editor/classic");
    
    if (!state.isMobile) {
      toast({
        title: "Création d'un nouveau CV",
        description: "Choisissez un modèle pour commencer"
      });
    }
  };

  const handleDelete = () => {
    if (!state.cvToDelete) return;
    
    const updatedCVs = state.userCVs.filter((cv: any) => cv.id !== state.cvToDelete);
    state.setUserCVs(updatedCVs);
    saveCVs(updatedCVs);
    
    toast({
      title: "CV supprimé",
      description: "Votre CV a été supprimé avec succès"
    });
    
    state.setShowDeleteConfirm(false);
    state.setCvToDelete(null);
  };

  const handleLogout = () => {
    resetCVPaymentStatus();
    secureStorage.remove('payment_token');
    state.logout();
    navigate("/");
    
    if (!state.isMobile) {
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !"
      });
    }
  };

  return {
    handleEdit,
    handleDownload,
    handleCreateNew,
    handleDelete,
    handleLogout
  };
}
