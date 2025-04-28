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
import AdDashboard from "./pages/admin/AdDashboard";

const App = () => {
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
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/editor" element={<EditorWithTemplate />} />
                <Route path="/editor/:templateId" element={<EditorWithTemplate />} />
                <Route path="/admin/ads" element={
                  <ProtectedRoute>
                    <AdDashboard />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CVProvider>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

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

const EditorWithTemplate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { templateId } = useParams();
  const { isAuthenticated, isLoading } = useAuth();
  const [hasProcessedParams, setHasProcessedParams] = useState(false);
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true, state: { from: location.pathname } });
      return;
    }
    
    if (!hasProcessedParams && !isLoading && isAuthenticated) {
      const params = new URLSearchParams(location.search);
      
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
      
      console.log("Template parameters:", { templateId, color, style });
      
      if (params.toString()) {
        const cvId = params.get('cvId');
        if (cvId) {
          navigate(location.pathname, { replace: true, state: { cvId } });
        } else {
          navigate(location.pathname, { replace: true });
        }
      }
      
      setHasProcessedParams(true);
      
      toast({
        title: "Modèle de CV sélectionné",
        description: `Le modèle ${templateId || 'par défaut'} a été appliqué avec succès.`,
      });
    }
  }, [location, navigate, templateId, isAuthenticated, isLoading, hasProcessedParams]);
  
  if (isLoading) return null;
  if (!isAuthenticated) return null;
  
  return <Index />;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const [lastActivity, setLastActivity] = useState(Date.now());
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true, state: { from: location.pathname } });
    }
    
    const SESSION_TIMEOUT = 30 * 60 * 1000;
    
    const checkSession = () => {
      const currentTime = Date.now();
      if (currentTime - lastActivity > SESSION_TIMEOUT) {
        navigate("/login", { replace: true });
      }
    };
    
    const sessionTimer = setInterval(checkSession, 60000);
    
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
  
  if (isLoading || !isAuthenticated) return null;
  
  return <>{children}</>;
};

const TooltipWrapper = ({ children }: { children: React.ReactNode }) => {
  return <TooltipProvider>{children}</TooltipProvider>;
};

const SecurityHeaders = () => {
  useEffect(() => {
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
