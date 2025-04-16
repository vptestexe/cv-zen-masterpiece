
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CVProvider } from "./contexts/CVContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

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
            <Route path="/editor" element={<Index />} />
            <Route path="/editor/:templateId" element={<Index />} />
            
            {/* Route 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CVProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
