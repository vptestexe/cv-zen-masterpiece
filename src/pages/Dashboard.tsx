import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Edit, Download, Trash2, Plus, LogOut, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  getDownloadCount, 
  updateDownloadCount, 
  hasDownloadsRemaining, 
  resetCVPaymentStatus,
  setInitialDownloadCount,
  PAYMENT_AMOUNT,
  secureStorage,
  canCreateNewCV,
  getTotalCVs,
  removeDuplicateCVs,
  FREE_DOWNLOADS_PER_CV,
  MAX_FREE_CVS
} from "@/utils/downloadManager";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import CVCard from "@/components/dashboard/CVCard";
import PaymentDialog from "@/components/dashboard/PaymentDialog";
import DeleteConfirmDialog from "@/components/dashboard/DeleteConfirmDialog";
import DuplicateAlertDialog from "@/components/dashboard/DuplicateAlertDialog";
import DashboardFooter from "@/components/dashboard/DashboardFooter";

const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
};

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

const saveCVs = (cvs) => {
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
  const [downloadLimitProgress, setDownloadLimitProgress] = useState(0);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
  const [duplicatesFound, setDuplicatesFound] = useState(0);

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
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
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
  
  const handleDownload = async (cvId, format = 'pdf') => {
    if (!hasDownloadsRemaining(cvId)) {
      setCurrentCvId(cvId);
      localStorage.setItem('cv_being_paid', cvId);
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

      if (hasDownloadsRemaining(cvId)) {
        if (!isMobile) {
          toast({
            title: "Préparation du téléchargement",
            description: `Génération du ${format === 'pdf' ? 'PDF' : 'document Word'} en cours...`
          });
        }

        const downloadId = generateUniqueId().substring(0, 8).toUpperCase();
        
        if (format === 'pdf') {
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });

          pdf.setFontSize(16);
          pdf.text(cv.title, 20, 20);
          pdf.setFontSize(12);
          pdf.text(`Dernière modification: ${new Date(cv.lastUpdated).toLocaleDateString()}`, 20, 30);

          pdf.setFontSize(10);
          pdf.setTextColor(200, 200, 200);
          pdf.text(`CV Zen Masterpiece - ID: ${downloadId}`, 20, 285);
          
          pdf.save(`cv-${cv.id}.pdf`);
        } else {
          const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>${cv.title}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                h1 { color: #333; }
                .watermark { color: #cccccc; font-size: 8pt; margin-top: 40px; }
              </style>
            </head>
            <body>
              <h1>${cv.title}</h1>
              <p>Dernière modification: ${new Date(cv.lastUpdated).toLocaleDateString()}</p>
              <div class="watermark">CV Zen Masterpiece - ID: ${downloadId}</div>
            </body>
            </html>
          `;
          
          const blob = new Blob([htmlContent], { type: 'application/vnd.ms-word' });
          
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `cv-${cv.id}.doc`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        const updatedCount = updateDownloadCount(cvId);
        setDownloadCounts(prev => ({
          ...prev,
          [cvId]: updatedCount
        }));

        console.log(`Téléchargement effectué. Compteur mis à jour: ${updatedCount.count}`);

        toast({
          title: "Téléchargement réussi",
          description: `Il vous reste ${updatedCount.count} téléchargements`
        });
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible de générer le document",
        variant: "destructive"
      });
    }
  };
  
  const handleRechargeClick = (cvId) => {
    setCurrentCvId(cvId);
    localStorage.setItem('cv_being_paid', cvId);
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
      
      try {
        setProcessingPayment(true);
        
        const simulateVerification = () => {
          const paymentSession = secureStorage.get('payment_token', null);
          
          const paymentSuccessful = paymentSession && 
            paymentSession.cvId === cvBeingPaid && 
            (Date.now() - paymentSession.timestamp) < 3600000;
            
          const paymentAmount = PAYMENT_AMOUNT;
          
          if (paymentSuccessful && paymentAmount === PAYMENT_AMOUNT) {
            secureStorage.remove('payment_token');
            
            setPaymentVerified(prev => ({
              ...prev,
              [cvBeingPaid]: true
            }));
            
            const updatedCount = updateDownloadCount(cvBeingPaid, true);
            setDownloadCounts(prev => ({
              ...prev,
              [cvBeingPaid]: updatedCount
            }));
            
            console.log(`Paiement vérifié pour CV ${cvBeingPaid}. Nouveau compteur: ${updatedCount.count}`);
            
            localStorage.removeItem('cv_being_paid');
            toast({
              title: "Paiement confirmé",
              description: "Vous disposez maintenant de 5 téléchargements pour ce CV.",
            });
          } else {
            toast({
              title: "Échec du paiement",
              description: "Le paiement n'a pas pu être vérifié.",
              variant: "destructive"
            });
          }
          
          setProcessingPayment(false);
        };
        
        setTimeout(simulateVerification, 1000);
      } catch (error) {
        console.error("Erreur de vérification:", error);
        toast({
          title: "Erreur de vérification",
          description: "Impossible de vérifier le paiement.",
          variant: "destructive"
        });
        setProcessingPayment(false);
      }
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
  }, [toast, processingPayment, isMobile]);
  
  const confirmDelete = (cvId) => {
    setCvToDelete(cvId);
    setShowDeleteConfirm(true);
  };
  
  const handleDelete = () => {
    if (!cvToDelete) return;
    
    const updatedCVs = userCVs.filter(cv => cv.id !== cvToDelete);
    setUserCVs(updatedCVs);
    
    saveCVs(updatedCVs);
    
    const freeDownloads = getTotalFreeDownloads();
    setDownloadLimitProgress(Math.min((freeDownloads / 2) * 100, 100));
    
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userCVs.map((cv) => (
              <CVCard
                key={cv.id}
                cv={cv}
                downloadCount={downloadCounts[cv.id]}
                processingPayment={processingPayment}
                onEdit={handleEdit}
                onDownload={handleDownload}
                onRecharge={handleRechargeClick}
                onDelete={confirmDelete}
              />
            ))}
          </div>
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
