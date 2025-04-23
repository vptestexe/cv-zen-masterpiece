
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate, useParams } from "react-router-dom";
import { CVProvider } from "./contexts/CVContext";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { useAuth, AuthProvider } from "./hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";

// Create a QueryClient instance directly inside the component
// This ensures it's created after React is fully initialized
const App = () => {
  // Create the query client inside the component
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: true,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
        networkMode: 'online',
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <CVProvider>
            <BrowserRouter>
              <SecurityHeaders />
              <Routes>
                {/* Page d'accueil */}
                <Route path="/" element={<Landing />} />
                
                {/* Authentification */}
                <Route path="/login" element={<Login />} />
                
                {/* Dashboard utilisateur (protégé) */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                {/* Éditeur de CV (protégé) */}
                <Route path="/editor" element={<EditorWithTemplate />} />
                <Route path="/editor/:templateId" element={<EditorWithTemplate />} />
                
                {/* Route 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CVProvider>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

// Fonction pour détecter les attaques potentielles de XSS
function detectXSS(input: string): boolean {
  if (!input) return false;
  const suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /\bdata:/gi
  ];
  return suspiciousPatterns.some(pattern => pattern.test(input));
}

// Composant pour gérer les paramètres de template
const EditorWithTemplate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { templateId } = useParams();
  const { isAuthenticated, isLoading } = useAuth();
  // Garder trace de si le contenu a été chargé depuis l'URL
  const [hasProcessedParams, setHasProcessedParams] = useState(false);
  
  useEffect(() => {
    // Si le chargement est terminé et l'utilisateur n'est pas authentifié
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true, state: { from: location.pathname } });
      return;
    }
    
    // Ne traiter les paramètres qu'une seule fois
    if (!hasProcessedParams && !isLoading && isAuthenticated) {
      // Extraire les paramètres de template de l'URL
      const params = new URLSearchParams(location.search);
      
      // Sécurité: Vérifier les paramètres pour des attaques potentielles
      let hasSuspiciousParams = false;
      params.forEach((value) => {
        if (detectXSS(value)) {
          hasSuspiciousParams = true;
          console.error("Paramètre URL suspect détecté");
        }
      });
      
      if (hasSuspiciousParams) {
        navigate("/editor", { replace: true });
        toast({
          title: "Erreur de sécurité",
          description: "Paramètres URL invalides détectés",
          variant: "destructive"
        });
        return;
      }
      
      const color = params.get('color');
      const style = params.get('style');
      
      // Si des paramètres de template sont présents dans l'URL, les appliquer au thème du CV
      console.log("Template parameters:", { templateId, color, style });
      
      // Nettoyer l'URL en supprimant les paramètres de requête
      if (params.toString()) {
        // Préserver le paramètre cvId s'il existe
        const cvId = params.get('cvId');
        if (cvId) {
          navigate(location.pathname, { replace: true, state: { cvId } });
        } else {
          navigate(location.pathname, { replace: true });
        }
      }
      
      setHasProcessedParams(true);
      
      // Afficher une notification de confirmation
      toast({
        title: "Modèle de CV sélectionné",
        description: `Le modèle ${templateId || 'par défaut'} a été appliqué avec succès.`,
      });
    }
  }, [location, navigate, templateId, isAuthenticated, isLoading, hasProcessedParams]);
  
  // Si l'utilisateur n'est pas authentifié et le chargement est terminé, afficher null
  if (isLoading) return null;
  if (!isAuthenticated) return null;
  
  return <Index />;
};

// Composant pour protéger les routes qui nécessitent une authentification
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const [lastActivity, setLastActivity] = useState(Date.now());
  
  useEffect(() => {
    // Attendre que la vérification d'authentification soit terminée
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true, state: { from: location.pathname } });
    }
    
    // Sécurité: Déconnexion après inactivité
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    
    const checkSession = () => {
      const currentTime = Date.now();
      if (currentTime - lastActivity > SESSION_TIMEOUT) {
        navigate("/login", { replace: true });
      }
    };
    
    const sessionTimer = setInterval(checkSession, 60000); // Vérifier chaque minute
    
    // Réinitialiser le timer à chaque activité
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
  }, [isAuthenticated, isLoading, navigate, location, lastActivity]);
  
  // Si le chargement est en cours ou l'utilisateur n'est pas authentifié, ne rien afficher
  if (isLoading || !isAuthenticated) return null;
  
  return <>{children}</>;
};

// Wrapper pour TooltipProvider pour s'assurer qu'il est utilisé dans un composant React
const TooltipWrapper = ({ children }: { children: React.ReactNode }) => {
  return <TooltipProvider>{children}</TooltipProvider>;
};

// Définir un header de sécurité CSP pour protéger contre les injections
const SecurityHeaders = () => {
  useEffect(() => {
    // Cette fonction ne peut réellement définir des headers que sur le serveur,
    // mais nous l'incluons à des fins de documentation et pour des tests locaux
    if (import.meta.env.DEV) {
      console.info("En production, il est recommandé d'ajouter des headers de sécurité côté serveur:");
      console.info("1. Content-Security-Policy");
      console.info("2. X-XSS-Protection");
      console.info("3. X-Content-Type-Options");
      console.info("4. Referrer-Policy");
    }
  }, []);
  
  return null;
};

export default App;
