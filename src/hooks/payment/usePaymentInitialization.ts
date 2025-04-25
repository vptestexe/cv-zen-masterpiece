
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { usePaiementProScript } from "./usePaiementProScript";
import { useMerchantId } from "./useMerchantId";
import { usePaiementProInit } from "./usePaiementProInit";
import { PAIEMENT_PRO_CONFIG } from "@/config/payment";

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
  const { fetchMerchantId, merchantIdError } = useMerchantId();
  const { loadScript, cleanupScript } = usePaiementProScript(
    () => initializePaiementPro(),
    (error) => {
      // Vérifier si l'erreur est liée à l'ID marchand ou au script
      if (merchantIdError) {
        setInitError(`Configuration: ${merchantIdError}`);
      } else {
        setInitError(error);
      }
    }
  );

  const checkNetworkConnectivity = (): boolean => {
    const isOnline = navigator.onLine;
    
    if (!isOnline && !initError) {
      setInitError("Aucune connexion internet détectée. Veuillez vérifier votre réseau.");
      toast({
        title: "Problème de connexion",
        description: "Vérifiez votre connexion internet",
        variant: "destructive"
      });
    }
    
    return isOnline;
  };

  const initializePaiementPro = async () => {
    if (isInitializing) return;
    
    if (!checkNetworkConnectivity()) return;
    
    setIsInitializing(true);
    setInitError(null);
    
    console.log("Tentative d'initialisation PaiementPro...", { 
      retries: initRetries,
      sandbox: PAIEMENT_PRO_CONFIG.SANDBOX_MODE
    });
    
    try {
      const merchantId = await fetchMerchantId();
      
      if (!merchantId) {
        throw new Error("ID marchand non disponible. Vérifiez la configuration Supabase.");
      }
      
      initializeSdk({
        merchantId,
        amount: 1000,
        description: "Téléchargement CV",
        callbackUrl: window.location.origin + "/dashboard",
        sandboxMode: PAIEMENT_PRO_CONFIG.SANDBOX_MODE
      });

      setIsInitializing(false);
      console.log("PaiementPro initialisé avec succès");
      
      toast({
        title: "Système de paiement prêt",
        description: "Vous pouvez maintenant procéder au paiement",
      });
    } catch (error) {
      console.error("Erreur d'initialisation PaiementPro:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      setInitError(errorMessage);
      
      if (initRetries < MAX_RETRIES) {
        const nextRetry = initRetries + 1;
        setInitRetries(nextRetry);
        
        // Délai progressif entre les tentatives
        const retryDelay = 3000 * Math.pow(1.5, nextRetry - 1);
        console.log(`Réessai d'initialisation (${nextRetry}/${MAX_RETRIES}) dans ${retryDelay/1000}s...`);
        
        toast({
          title: "Nouvelle tentative",
          description: `Réessai d'initialisation (${nextRetry}/${MAX_RETRIES})...`,
        });
        
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
        if (checkNetworkConnectivity()) {
          loadScript();
        }
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
    
    if (checkNetworkConnectivity()) {
      loadScript();
    }
  };

  useEffect(() => {
    if (!open) {
      setIsInitialized(false);
      setIsInitializing(false);
      setInitError(null);
      setInitRetries(0);
      cleanupScript();
    }
  }, [open, cleanupScript]);

  return {
    isInitialized,
    isInitializing,
    initError,
    initRetries,
    handleRetryInit
  };
};
