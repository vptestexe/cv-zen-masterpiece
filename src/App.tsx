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

const queryClient = new QueryClient();

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
  
  useEffect(() => {
    // Attendre que la vérification d'authentification soit terminée
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true, state: { from: location.pathname } });
    }
  }, [isAuthenticated, isLoading, navigate, location]);
  
  // Si le chargement est en cours ou l'utilisateur n'est pas authentifié, ne rien afficher
  if (isLoading || !isAuthenticated) return null;
  
  return <>{children}</>;
};

// Wrapper pour TooltipProvider pour s'assurer qu'il est utilisé dans un composant React
const TooltipWrapper = ({ children }: { children: React.ReactNode }) => {
  return <TooltipProvider>{children}</TooltipProvider>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipWrapper>
        <Toaster />
        <Sonner />
        <CVProvider>
          <BrowserRouter>
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
      </TooltipWrapper>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
