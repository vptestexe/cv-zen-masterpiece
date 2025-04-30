
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CVProvider } from "./contexts/CVContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "./hooks/use-auth";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdDashboard from "./pages/admin/AdDashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import EditorWithTemplate from "./components/editor/EditorWithTemplate";
import SecurityHeaders from "./components/common/SecurityHeaders";

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

export default App;
