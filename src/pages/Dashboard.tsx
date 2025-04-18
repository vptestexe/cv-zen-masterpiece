
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

const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
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
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userCVs, setUserCVs] = useState([]);
  const [userName, setUserName] = useState("");
  const { isAuthenticated, user, logout } = useAuth();
  const isMobile = useIsMobile();
  
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
      
      setUserCVs(getSavedCVs());
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
  
  const handleDownload = (cvId) => {
    if (isMobile) {
      window.location.href = "wave://pay?recipient=cvzenmasterpiece&amount=1000";
    } else {
      window.open("https://wave.com/qr/cvzenmasterpiece?amount=1000", "_blank");
    }
  };
  
  const handleDelete = (cvId) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce CV ?")) {
      const updatedCVs = userCVs.filter(cv => cv.id !== cvId);
      setUserCVs(updatedCVs);
      
      saveCVs(updatedCVs);
      
      if (!isMobile) {
        toast({
          title: "CV supprimé",
          description: "Votre CV a été supprimé avec succès"
        });
      }
    }
  };
  
  const handleCreateNew = () => {
    navigate("/editor/classic");
    
    if (!isMobile) {
      toast({
        title: "Création d'un nouveau CV",
        description: "Choisissez un modèle pour commencer"
      });
    }
  };
  
  const handleLogout = () => {
    logout();
    
    navigate("/");
    
    if (!isMobile) {
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !"
      });
    }
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1 flex-1"
                    onClick={() => handleDownload(cv.id)}
                  >
                    <Download className="h-4 w-4" />
                    Télécharger
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive hover:text-destructive gap-1 flex-1"
                    onClick={() => handleDelete(cv.id)}
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
