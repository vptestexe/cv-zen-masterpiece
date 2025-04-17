
import { useEffect, useState, createContext, useContext } from "react";

// Créer un contexte d'authentification pour éviter de répéter les vérifications
const AuthContext = createContext<{
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { name: string; email: string } | null;
  login: (email: string, name: string) => void;
  logout: () => void;
} | undefined>(undefined);

// Fournisseur du contexte d'authentification
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
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
    // Stocker les informations d'authentification
    localStorage.setItem('auth_token', 'simulated_jwt_token');
    localStorage.setItem('user_email', email);
    localStorage.setItem('user_name', name);
    
    // Mettre à jour l'état
    setIsAuthenticated(true);
    setUser({ name, email });
  };

  const logout = () => {
    // Supprimer les informations d'authentification
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    
    // Mettre à jour l'état
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Si le hook est utilisé en dehors du Provider, vérifier directement le localStorage
    const authToken = localStorage.getItem('auth_token');
    const userName = localStorage.getItem('user_name');
    const userEmail = localStorage.getItem('user_email');
    
    const isAuthenticated = !!authToken;
    const user = userName && userEmail ? { name: userName, email: userEmail } : null;
    
    const login = (email: string, name: string) => {
      localStorage.setItem('auth_token', 'simulated_jwt_token');
      localStorage.setItem('user_email', email);
      localStorage.setItem('user_name', name);
    };
    
    const logout = () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_name');
    };
    
    return { isAuthenticated, isLoading: false, user, login, logout };
  }
  
  return context;
};
