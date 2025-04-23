
import { useEffect, useState, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";

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
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
} | undefined>(undefined);

// Fournisseur du contexte d'authentification
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session ? "session exists" : "no session");
        setSession(session);
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "",
          });
          setIsAuthenticated(true);
          
          // Store auth token in localStorage for better session persistence
          localStorage.setItem('auth_token', session.access_token);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          
          // Clear auth token from localStorage when session ends
          localStorage.removeItem('auth_token');
        }
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session ? "session exists" : "no session");
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "",
        });
        setIsAuthenticated(true);
        localStorage.setItem('auth_token', session.access_token);
      } else {
        // Clear auth token if no session exists
        localStorage.removeItem('auth_token');
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur votre espace personnel",
      });

    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message || "Une erreur est survenue lors de la connexion",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès",
      });

    } catch (error: any) {
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur est survenue lors de l'inscription",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      // First check if there's an active session to avoid errors
      const { data: sessionData } = await supabase.auth.getSession();
      
      // Only attempt to sign out if there's a valid session
      if (sessionData.session) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          throw error;
        }
      } else {
        // If no session exists, just clean up the local state
        console.log("No active session found, cleaning up local state only");
      }
      
      // Always clean up local state regardless of session status
      setUser(null);
      setIsAuthenticated(false);
      setSession(null);
      localStorage.removeItem('auth_token');
      
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });

    } catch (error: any) {
      console.error("Logout error:", error);
      
      // Even if there's an error, attempt to clean up local state
      setUser(null);
      setIsAuthenticated(false);
      setSession(null);
      localStorage.removeItem('auth_token');
      
      toast({
        title: "Erreur de déconnexion",
        description: error.message || "Une erreur est survenue lors de la déconnexion",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, signUp, logout }}>
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
