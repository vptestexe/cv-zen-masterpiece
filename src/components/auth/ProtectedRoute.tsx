
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

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

export default ProtectedRoute;
