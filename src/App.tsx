
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { CVProvider } from "./contexts/CVContext";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

// Component to handle template parameters
const EditorWithTemplate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Extract template parameters from the URL
    const params = new URLSearchParams(location.search);
    const color = params.get('color');
    const style = params.get('style');
    
    // If there are template parameters in the URL, apply them to the CV theme
    // This would be handled by the CVContext
    console.log("Template parameters:", { color, style });
    
    // Clean up the URL by removing the query parameters
    if (params.toString()) {
      // Navigate to the same path without query parameters
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);
  
  return <Index />;
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
            
            {/* Dashboard utilisateur */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Éditeur de CV */}
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
