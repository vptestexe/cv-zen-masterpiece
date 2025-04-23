
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AuthUser } from "./types";

export const loginUser = async (email: string, password: string) => {
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

export const signUpUser = async (email: string, password: string, name: string) => {
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

export const logoutUser = async () => {
  try {
    await supabase.auth.signOut({ scope: 'local' });
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt !",
    });
  } catch (error: any) {
    toast({
      title: "Erreur de déconnexion",
      description: error.message || "Une erreur est survenue lors de la déconnexion",
      variant: "destructive",
    });
    throw error;
  }
};
