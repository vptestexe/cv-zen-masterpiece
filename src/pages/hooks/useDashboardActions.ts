
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
  PAYMENT_AMOUNT,
  resetCVPaymentStatus
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
      console.log("Édition du CV:", cv.id, "template:", cv.template || 'classic');
      // Utiliser un objet état plutôt que query params pour plus de fiabilité
      navigate(`/editor/${cv.template || 'classic'}`, { state: { cvId } });
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
    
    try {
      console.log("Création d'un nouveau CV - navigation vers /editor/classic");
      
      // Préparons le localStorage pour éviter des problèmes de timing
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) {
        console.error("Erreur: Authentification manquante");
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour créer un CV",
          variant: "destructive"
        });
        navigate("/login");
        return;
      }
      
      // Utiliser un état explicitement vide pour indiquer qu'il s'agit d'un nouveau CV
      navigate("/editor/classic", { state: { newCv: true, timestamp: Date.now() } });
      
      if (!state.isMobile) {
        toast({
          title: "Création d'un nouveau CV",
          description: "Vous pouvez maintenant créer votre CV"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la navigation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer un nouveau CV. Veuillez réessayer.",
        variant: "destructive"
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
    try {
      // Nettoyer d'abord toutes les données locales
      resetCVPaymentStatus();
      secureStorage.remove('payment_token');
      localStorage.removeItem('auth_token');
      
      // Marquer la tentative de déconnexion dans le localStorage pour éviter les boucles de redirection
      localStorage.setItem('logout_in_progress', 'true');
      
      // Appeler la fonction de déconnexion et gérer la navigation
      state.logout()
        .catch((error: any) => {
          console.warn("Logout API call failed, but local state was cleaned:", error);
        })
        .finally(() => {
          // Toujours naviguer vers la page de connexion, quel que soit le résultat de l'API
          setTimeout(() => {
            localStorage.removeItem('logout_in_progress');
            navigate("/login");
          }, 100);
          
          if (!state.isMobile) {
            toast({
              title: "Déconnexion réussie",
              description: "À bientôt !"
            });
          }
        });
    } catch (error) {
      console.error("Error during logout cleanup:", error);
      // Forcer la déconnexion en nettoyant l'état local et en redirigeant
      localStorage.removeItem('auth_token');
      localStorage.removeItem('logout_in_progress');
      navigate("/login");
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
