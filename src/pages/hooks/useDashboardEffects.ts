
import { useEffect } from "react";
import { useSessionTimeout } from "@/hooks/use-session-timeout";
import { useCVDataSync } from "@/hooks/use-cv-data-sync";

export function useDashboardEffects(state: any) {
  useEffect(() => {
    if (!state.isAuthenticated) {
      state.navigate("/login");
      
      if (!state.isMobile) {
        state.toast({
          title: "Accès refusé",
          description: "Veuillez vous connecter pour accéder à votre tableau de bord",
          variant: "destructive"
        });
      }
    } else {
      state.setUserName(state.user?.name || "Utilisateur");
      if (state.user?.id) {
        localStorage.setItem('current_user_id', state.user.id);
      }
    }
  }, [state.isAuthenticated]);

  // Use our session timeout hook
  useSessionTimeout(
    state.isAuthenticated,
    state.isLoading,
    () => {
      state.setSessionExpired(true);
      state.handleLogout();
    }
  );

  // We removed the usePaymentVerification call since we're removing payment features
  useCVDataSync(state);
}
