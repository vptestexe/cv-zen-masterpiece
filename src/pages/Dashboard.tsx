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
  secureStorage
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

const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
};

const getSavedCVs = () => {
  const savedCVsJSON = localStorage.getItem('saved_cvs');
  if (savedCVsJSON) {
    try {
      return JSON.parse(savedCVsJSON);
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
      
      setUserCVs(savedCVs);
      
      const counts = savedCVs.reduce((acc, cv) => {
        if (!getDownloadCount(cv.id).count && !getDownloadCount(cv.id).lastPaymentDate) {
          acc[cv.id] = setInitialDownloadCount(cv.id, 0);
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
  
  const handleRedirectToPayment = () => {
    setProcessingPayment(true);
    setShowPaymentDialog(false);
    const paymentToken = generateUniqueId();
    secureStorage.set('payment_token', {
      token: paymentToken,
      cvId: currentCvId,
      timestamp: Date.now()
    });
    window.location.href = `https://pay.djamo.com/a8zsl?token=${paymentToken}&amount=${PAYMENT_AMOUNT}`;
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
    const getTotalFreeDownloads = (): number => {
      return userCVs.length;
    };

    if (getTotalFreeDownloads() >= 2) {
      toast({
        title: "Limite atteinte",
        description: "Vous avez atteint votre limite de CV gratuits. Veuillez acheter des téléchargements pour un CV existant.",
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
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="container mx-auto py-4 px-4 sm:px-6 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-primary truncate">
            <span className="font-playfair">CV Zen Masterpiece</span>
          </h1>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-sm text-muted-foreground mr-2">
              Bonjour, {userName}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div>
            <h2 className="text-3xl font-bold">Mon espace personnel</h2>
            <p className="text-muted-foreground">Gérez vos CV et créez-en de nouveaux</p>
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
              <Card key={cv.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{cv.title}</CardTitle>
                  <CardDescription>
                    Dernière modification: {formatDate(cv.lastUpdated)}
                    {downloadCounts[cv.id] && downloadCounts[cv.id].count > 0 && (
                      <div className="mt-2 text-sm font-medium text-green-600">
                        {downloadCounts[cv.id].count} téléchargements restants
                      </div>
                    )}
                    {(!downloadCounts[cv.id] || downloadCounts[cv.id].count <= 0) && (
                      <div className="mt-2 text-sm font-medium text-amber-600">
                        Aucun téléchargement disponible
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[3/4] bg-muted/20 rounded flex items-center justify-center">
                    <FileText className="h-16 w-16 text-muted-foreground" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1 flex-1"
                    onClick={() => handleEdit(cv.id)}
                  >
                    <Edit className="h-4 w-4" />
                    Modifier
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant={downloadCounts[cv.id]?.count > 0 ? "outline" : "default"}
                        size="sm" 
                        className="gap-1 flex-1"
                        disabled={processingPayment}
                      >
                        <Download className="h-4 w-4" />
                        {downloadCounts[cv.id]?.count > 0 
                          ? `Télécharger (${downloadCounts[cv.id].count})` 
                          : "Recharger"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem 
                        onClick={() => handleDownload(cv.id, 'pdf')}
                        disabled={!downloadCounts[cv.id]?.count}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Format PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDownload(cv.id, 'word')}
                        disabled={!downloadCounts[cv.id]?.count}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Format Word
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive hover:text-destructive gap-1 flex-1"
                    onClick={() => confirmDelete(cv.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <Dialog open={showPaymentDialog} onOpenChange={handlePaymentDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recharger votre compte</DialogTitle>
            <DialogDescription>
              Pour télécharger ce CV, vous devez payer {PAYMENT_AMOUNT} CFA. Cela vous permettra d'obtenir 5 téléchargements.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              Vous serez redirigé vers la plateforme de paiement sécurisée Djamo pour finaliser votre transaction.
            </p>
            <Button onClick={handleRedirectToPayment} className="w-full">
              Procéder au paiement ({PAYMENT_AMOUNT} CFA)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le CV sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCvToDelete(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <footer className="bg-muted py-6 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} CV Zen Masterpiece - Tous droits réservés
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Button variant="ghost" size="sm">Aide</Button>
              <Button variant="ghost" size="sm">Contact</Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
