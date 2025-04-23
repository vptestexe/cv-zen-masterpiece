
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext } from "./auth-context";
import { AuthUser } from "./types";
import { loginUser, signUpUser, logoutUser } from "./auth-actions";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
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
          localStorage.setItem('auth_token', session.access_token);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('auth_token');
        }
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "",
        });
        setIsAuthenticated(true);
        localStorage.setItem('auth_token', session.access_token);
      } else {
        localStorage.removeItem('auth_token');
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      user,
      login: loginUser,
      signUp: signUpUser,
      logout: logoutUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
