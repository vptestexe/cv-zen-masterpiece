
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { PAYMENT_AMOUNT, resetCVPaymentStatus, setInitialDownloadCount, getDownloadCount, updateDownloadCount, hasDownloadsRemaining, canCreateNewCV, FREE_DOWNLOADS_PER_CV, MAX_FREE_CVS, secureStorage, removeDuplicateCVs } from "@/utils/downloadManager";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import PaymentDialog from "@/components/dashboard/PaymentDialog";
import DeleteConfirmDialog from "@/components/dashboard/DeleteConfirmDialog";
import DuplicateAlertDialog from "@/components/dashboard/DuplicateAlertDialog";
import CVList from "@/components/dashboard/CVList";
import { useInsertPayment } from "@/hooks/use-payments";
import { generateUniqueId } from "@/utils/generateUniqueId";
import { downloadCvAsPdf, downloadCvAsWord } from "@/utils/download";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const getSavedCVs = () => {
  const savedCVsJSON = localStorage.getItem('saved_cvs');
  if (savedCVsJSON) {
    try {
      const cvs = JSON.parse(savedCVsJSON);
      return removeDuplicateCVs(cvs);
    } catch (e) {
      console.error("Erreur lors de la récupération des CV:", e);
      return [];
    }
  }
  return [];
};

const saveCVs = (cvs: any[]) => {
  localStorage.setItem('saved_cvs', JSON.stringify(cvs));
  
  // Enregistrer une copie cryptée pour la sécurité
  secureStorage.set('saved_cvs_backup', cvs);
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userCVs, setUserCVs] = useState([]);
  const [userName, setUserName] = useState("");
  const { isAuthenticated, user, logout } = useAuth();
  const isMobile = useIsMobile();
  const [paymentVerified, setPaymentVerified] = useState({});
  const [processingPayment, setProcessingPayment] = useState(false);
  const [downloadCounts, setDownloadCounts] = useState<{[key: string]: { count: number, lastPaymentDate: string }}>({});
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [currentCvId, setCurrentCvId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [cvToDelete, setCvToDelete] = useState<string | null>(null);
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
  const [duplicatesFound, setDuplicatesFound] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [sessionExpired, setSessionExpired] = useState(false);

  const { mutate: insertPayment } = useInsertPayment();

  useEffect(() => {
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    
    const checkSession = () => {
      const currentTime = Date.now();
      if (currentTime - lastActivity > SESSION_TIMEOUT) {
        setSessionExpired(true);
        handleLogout();
      }
    };
    
    const sessionTimer = setInterval(checkSession, 60000); // Vérifier chaque minute
    
    const resetTimer = () => {
      setLastActivity(Date.now());
    };
    
    window.addEventListener('click', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('scroll', resetTimer);
    window.addEventListener('mousemove', resetTimer);
    
    return () => {
      clearInterval(sessionTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('mousemove', resetTimer);
    };
  }, [lastActivity]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      
      if (!isMobile) {
        toast({
          title: "Accès refusé",
          description: "Veuillez vous connecter pour accéder à votre tableau de bord",
          variant: "destructive"
        });
      }
    } else {
      setUserName(user?.name || "Utilisateur");
      
      let savedCVs = getSavedCVs();
      const secureBackup = secureStorage.get('saved_cvs_backup', null);
      
      if (!savedCVs.length && secureBackup && secureBackup.length) {
        savedCVs = secureBackup;
        saveCVs(savedCVs);
        toast({
          title: "Récupération de données",
          description: "Les données sauvegardées ont été restaurées avec succès.",
          variant: "default"
        });
      }
      
      const originalCount = savedCVs.length;
      const uniqueCVs = removeDuplicateCVs(savedCVs);
      const duplicatesRemoved = originalCount - uniqueCVs.length;
      
      if (duplicatesRemoved > 0) {
        setDuplicatesFound(duplicatesRemoved);
        setShowDuplicateAlert(true);
        saveCVs(uniqueCVs);
      }
      
      setUserCVs(uniqueCVs);
      
      const counts = uniqueCVs.reduce((acc, cv) => {
        if (!getDownloadCount(cv.id).count && !getDownloadCount(cv.id).lastPaymentDate) {
          acc[cv.id] = setInitialDownloadCount(cv.id);
        } else {
          acc[cv.id] = getDownloadCount(cv.id);
        }
        return acc;
      }, {} as {[key: string]: { count: number, lastPaymentDate: string }});
      
      setDownloadCounts(counts);
      
      console.log("État initial des compteurs:", counts);
    }
  }, [isAuthenticated, navigate, toast, user, isMobile]);
  
  const handleEdit = (cvId) => {
    const cv = userCVs.find(cv => cv.id === cvId);
    if (cv) {
      navigate(`/editor/${cv.template}`, { state: { cvId } });
      
      if (!isMobile) {
        toast({
          title: "Modification du CV",
          description: "Vous pouvez maintenant modifier votre CV"
        });
      }
    }
  };

  const handleDownload = async (cvId, format = "pdf") => {
    if (!hasDownloadsRemaining(cvId)) {
      setCurrentCvId(cvId);
      localStorage.setItem("cv_being_paid", cvId);
      setShowPaymentDialog(true);
      return;
    }
    try {
      const cv = userCVs.find(cv => cv.id === cvId);
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
      setDownloadCounts(prev => ({
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

  const handleRechargeClick = (cvId) => {
    setCurrentCvId(cvId);
    localStorage.setItem("cv_being_paid", cvId);
    setShowPaymentDialog(true);
  };

  const handlePaymentDialogClose = () => {
    setShowPaymentDialog(false);
    resetCVPaymentStatus();
    setCurrentCvId(null);
  };

  useEffect(() => {
    const verifyPayment = async () => {
      const cvBeingPaid = localStorage.getItem('cv_being_paid');
      if (!cvBeingPaid || processingPayment) return;

      const paymentSession = secureStorage.get('payment_token', null);
      const paymentSuccessful = paymentSession &&
        paymentSession.cvId === cvBeingPaid &&
        (Date.now() - paymentSession.timestamp) < 3600000;
      const paymentAmount = PAYMENT_AMOUNT;

      if (paymentSuccessful && paymentAmount === PAYMENT_AMOUNT) {
        setProcessingPayment(true);
        if (user?.email) {
          insertPayment(
            {
              userId: user.id || '',
              cvId: cvBeingPaid,
              amount: PAYMENT_AMOUNT,
              transactionId: paymentSession?.transactionId || null,
            },
            {
              onSuccess: () => {
                setPaymentVerified(prev => ({ ...prev, [cvBeingPaid]: true }));
                const updatedCount = updateDownloadCount(cvBeingPaid, true);
                setDownloadCounts(prev => ({
                  ...prev,
                  [cvBeingPaid]: updatedCount
                }));
                localStorage.removeItem('cv_being_paid');
                setProcessingPayment(false);
                toast({
                  title: "Paiement confirmé",
                  description: "Vous disposez maintenant de 5 téléchargements pour ce CV.",
                });
              },
              onError: () => {
                setProcessingPayment(false);
                toast({
                  title: "Erreur enregistrement paiement",
                  description: "Impossible d'enregistrer le paiement en base",
                  variant: "destructive"
                });
              },
            }
          );
        }
      } else {
        toast({
          title: "Échec du paiement",
          description: "Le paiement n'a pas pu être vérifié.",
          variant: "destructive"
        });
      }
      setProcessingPayment(false);
    };

    const checkPaymentReturn = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment_status');
      
      if (paymentStatus) {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        
        verifyPayment();
      }
    };
    
    checkPaymentReturn();
    
    const cvBeingPaid = localStorage.getItem('cv_being_paid');
    if (cvBeingPaid && !processingPayment) {
      verifyPayment();
    }
  }, [toast, processingPayment, isMobile, insertPayment, user]);

  const confirmDelete = (cvId) => {
    setCvToDelete(cvId);
    setShowDeleteConfirm(true);
  };

  const handleDelete = () => {
    if (!cvToDelete) return;
    
    const updatedCVs = userCVs.filter(cv => cv.id !== cvToDelete);
    setUserCVs(updatedCVs);
    
    saveCVs(updatedCVs);
    
    toast({
      title: "CV supprimé",
      description: "Votre CV a été supprimé avec succès"
    });
    
    setShowDeleteConfirm(false);
    setCvToDelete(null);
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
    
    if (!isMobile) {
      toast({
        title: "Création d'un nouveau CV",
        description: "Choisissez un modèle pour commencer"
      });
    }
  };

  const handleLogout = () => {
    resetCVPaymentStatus();
    secureStorage.remove('payment_token');
    
    logout();
    
    navigate("/");
    
    if (!isMobile) {
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !"
      });
    }
  };

  const getTotalFreeDownloads = (): number => {
    return userCVs.length;
  };

  const handleCloseDuplicateAlert = () => {
    setShowDuplicateAlert(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader userName={userName} onLogout={handleLogout} />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div>
            <h2 className="text-3xl font-bold">Mon espace personnel</h2>
            <p className="text-muted-foreground">
              Gérez vos CV et créez-en de nouveaux
              <span className="ml-2 text-sm font-medium text-amber-600">
                (limite de {MAX_FREE_CVS} CV gratuits)
              </span>
            </p>
          </div>
          <Button onClick={handleCreateNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Créer un nouveau CV
          </Button>
        </div>
        {userCVs.length === 0 ? (
          <Card className="w-full p-12 text-center">
            <CardContent className="flex flex-col items-center justify-center pt-6">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucun CV trouvé</h3>
              <p className="text-muted-foreground mb-6">Vous n'avez pas encore créé de CV. Commencez maintenant !</p>
              <Button onClick={handleCreateNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Créer mon premier CV
              </Button>
            </CardContent>
          </Card>
        ) : (
          <CVList
            cvs={userCVs}
            downloadCounts={downloadCounts}
            processingPayment={processingPayment}
            onEdit={handleEdit}
            onDownload={handleDownload}
            onRecharge={handleRechargeClick}
            onDelete={confirmDelete}
          />
        )}
      </main>
      <PaymentDialog open={showPaymentDialog} onClose={handlePaymentDialogClose} />
      <DeleteConfirmDialog
        open={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        onDelete={handleDelete}
      />
      <DuplicateAlertDialog
        open={showDuplicateAlert}
        duplicatesFound={duplicatesFound}
        onClose={handleCloseDuplicateAlert}
      />
      <DashboardFooter />
    </div>
  );
};

export default Dashboard;
