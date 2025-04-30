
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import Index from "@/pages/Index";

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

export default EditorWithTemplate;
