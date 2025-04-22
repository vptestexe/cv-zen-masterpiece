
import { useEffect, useState, createContext, useContext } from "react";

// Define a more complete user type that includes the id
type AuthUser = {
  id?: string;
  name: string;
  email: string;
};

// Créer un contexte d'authentification pour éviter de répéter les vérifications
const AuthContext = createContext<{
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: (email: string, name: string, id?: string) => void;
  logout: () => void;
} | undefined>(undefined);

// Fournisseur du contexte d'authentification
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Vérifier si un token existe dans le localStorage
    const authToken = localStorage.getItem('auth_token');
    const userName = localStorage.getItem('user_name');
    const userEmail = localStorage.getItem('user_email');
    const userId = localStorage.getItem('user_id');

    if (authToken) {
      setIsAuthenticated(true);
      if (userName && userEmail) {
        setUser({ name: userName, email: userEmail, id: userId || undefined });
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = (email: string, name: string, id?: string) => {
    // Stocker les informations d'authentification
    localStorage.setItem('auth_token', 'simulated_jwt_token');
    localStorage.setItem('user_email', email);
    localStorage.setItem('user_name', name);
    if (id) localStorage.setItem('user_id', id);
    
    // Mettre à jour l'état
    setIsAuthenticated(true);
    setUser({ name, email, id });
  };

  const logout = () => {
    // Supprimer les informations d'authentification
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_id');
    
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
