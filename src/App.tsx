
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { CVProvider } from "./contexts/CVContext";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { useToast } from "./hooks/use-toast";

const queryClient = new QueryClient();

// Service d'authentification simplifié (dans une vraie application, on utiliserait un contexte d'authentification)
const getAuthStatus = () => {
  const authToken = localStorage.getItem('auth_token');
  return !!authToken; // Converti en booléen
};

// Composant pour gérer l'authentification
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isAuthenticated = getAuthStatus();
  
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Accès refusé",
        description: "Veuillez vous connecter pour accéder à cette page",
        variant: "destructive"
      });
      navigate("/login");
    }
  }, [isAuthenticated, navigate, toast]);
  
  return isAuthenticated ? <>{children}</> : null;
};

// Composant pour gérer les paramètres de template
const EditorWithTemplate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Extraire les paramètres de template de l'URL
    const params = new URLSearchParams(location.search);
    const color = params.get('color');
    const style = params.get('style');
    
    // Si des paramètres de template sont présents dans l'URL, les appliquer au thème du CV
    console.log("Template parameters:", { color, style });
    
    // Nettoyer l'URL en supprimant les paramètres de requête
    if (params.toString()) {
      // Naviguer vers le même chemin sans paramètres de requête
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);
  
  return (
    <ProtectedRoute>
      <Index />
    </ProtectedRoute>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
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
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
