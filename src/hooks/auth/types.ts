
import { User } from "@supabase/supabase-js";

export type AuthUser = {
  id?: string;
  name: string;
  email: string;
};

export type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
};
