
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { usePaiementProScript } from "./usePaiementProScript";
import { useMerchantId } from "./useMerchantId";
import { usePaiementProInit } from "./usePaiementProInit";

export interface UsePaymentInitializationReturn {
  isInitialized: boolean;
  isInitializing: boolean;
  initError: string | null;
  initRetries: number;
  handleRetryInit: () => void;
}

export const usePaymentInitialization = (open: boolean): UsePaymentInitializationReturn => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [initRetries, setInitRetries] = useState(0);
  const { toast } = useToast();
  const MAX_RETRIES = 3;

  const { isInitialized, initializeSdk, setIsInitialized } = usePaiementProInit();
  const { fetchMerchantId } = useMerchantId();
  const { loadScript, cleanupScript } = usePaiementProScript(
    () => initializePaiementPro(),
    (error) => setInitError(error)
  );

  const initializePaiementPro = async () => {
    if (isInitializing) return;
    
    setIsInitializing(true);
    setInitError(null);
    
    console.log("Tentative d'initialisation PaiementPro...", { retries: initRetries });
    
    try {
      const merchantId = await fetchMerchantId();
      
      initializeSdk({
        merchantId,
        amount: 1000,
        description: "Téléchargement CV",
        callbackUrl: window.location.origin + "/dashboard",
      });

      setIsInitializing(false);
      console.log("PaiementPro initialisé avec succès");
    } catch (error) {
      console.error("Erreur d'initialisation PaiementPro:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      setInitError(errorMessage);
      
      if (initRetries < MAX_RETRIES) {
        const nextRetry = initRetries + 1;
        setInitRetries(nextRetry);
        
        const retryDelay = 3000 * nextRetry;
        console.log(`Réessai d'initialisation (${nextRetry}/${MAX_RETRIES}) dans ${retryDelay/1000}s...`);
        
        setTimeout(() => {
          setIsInitializing(false);
          loadScript();
        }, retryDelay);
      } else {
        toast({
          title: "Erreur de configuration",
          description: "Impossible d'initialiser le système de paiement. Veuillez réessayer plus tard.",
          variant: "destructive"
        });
        setIsInitializing(false);
      }
    }
  };

  useEffect(() => {
    if (open) {
      console.log("Dialog ouvert, réinitialisation de l'état");
      setIsInitialized(false);
      setIsInitializing(false);
      setInitError(null);
      setInitRetries(0);
      
      const timer = setTimeout(() => {
        loadScript();
      }, 300);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [open]);

  const handleRetryInit = () => {
    console.log("Tentative de réinitialisation manuelle");
    setIsInitialized(false);
    setIsInitializing(false);
    setInitError(null);
    setInitRetries(0);
    loadScript();
  };

  useEffect(() => {
    if (!open) {
      setIsInitialized(false);
      setIsInitializing(false);
      setInitError(null);
      setInitRetries(0);
      cleanupScript();
    }
  }, [open]);

  return {
    isInitialized,
    isInitializing,
    initError,
    initRetries,
    handleRetryInit
  };
};
