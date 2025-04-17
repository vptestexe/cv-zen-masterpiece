
import { useEffect, useState } from "react";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    // Vérifier si un token existe dans le localStorage
    const authToken = localStorage.getItem('auth_token');
    const userName = localStorage.getItem('user_name');
    const userEmail = localStorage.getItem('user_email');

    if (authToken) {
      setIsAuthenticated(true);
      if (userName && userEmail) {
        setUser({ name: userName, email: userEmail });
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = (email: string, name: string) => {
    localStorage.setItem('auth_token', 'simulated_jwt_token');
    localStorage.setItem('user_email', email);
    localStorage.setItem('user_name', name);
    setIsAuthenticated(true);
    setUser({ name, email });
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    // Ne pas supprimer les CV lors de la déconnexion
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout
  };
};
