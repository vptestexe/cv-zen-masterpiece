
import { useState, useEffect, useCallback } from "react";
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
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const { toast } = useToast();
  
  const { isInitialized, initializeSdk, setIsInitialized } = usePaiementProInit();
  const { fetchMerchantId, merchantIdError } = useMerchantId();
  
  const checkNetworkConnectivity = useCallback((): boolean => {
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
  }, [initError, toast]);
  
  const initializePaiementPro = useCallback(async () => {
    if (isInitializing) return;
    
    if (!checkNetworkConnectivity()) return;
    
    setIsInitializing(true);
    setInitError(null);
    
    console.log("Tentative d'initialisation PaiementPro...", { 
      retries: initRetries,
      sandbox: PAIEMENT_PRO_CONFIG.SANDBOX_MODE
    });
    
    try {
      // Vérification préalable que le SDK est bien chargé
      if (!window.PaiementPro) {
        console.warn("SDK PaiementPro non disponible, attente...");
        // Attendre un peu plus longtemps que le délai de 500ms dans le script loader
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (!window.PaiementPro) {
          throw new Error("SDK PaiementPro non disponible après chargement du script");
        }
      }
      
      const merchantId = await fetchMerchantId();
      
      if (!merchantId) {
        throw new Error("ID marchand non disponible");
      }

      // URL de callback absolu
      const callbackUrl = new URL("/dashboard", window.location.origin).toString();
      
      // Initialiser avec l'approche basée sur l'exemple
      const paiementProInstance = initializeSdk({
        merchantId,
        amount: 1000,
        description: "Téléchargement CV",
        callbackUrl: callbackUrl,
        sandboxMode: PAIEMENT_PRO_CONFIG.SANDBOX_MODE
      });

      setIsInitializing(false);
      console.log("PaiementPro initialisé avec succès");
      
      toast({
        title: "Système de paiement prêt",
        description: "Vous pouvez maintenant procéder au paiement",
      });
      
      return paiementProInstance;
    } catch (error) {
      console.error("Erreur d'initialisation PaiementPro:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      setInitError(errorMessage);
      setIsInitializing(false);
      
      toast({
        title: "Erreur d'initialisation",
        description: "Impossible d'initialiser le système de paiement",
        variant: "destructive"
      });
      
      return null;
    }
  }, [initRetries, toast, fetchMerchantId, initializeSdk, checkNetworkConnectivity]);
  
  const onScriptLoaded = useCallback(() => {
    console.log("[PaiementPro] Script chargé avec succès");
    setScriptLoaded(true);
    // Délai court pour permettre à l'objet global d'être correctement initialisé
    setTimeout(() => initializePaiementPro(), 300);
  }, [initializePaiementPro]);
  
  const onScriptError = useCallback((error: string) => {
    if (merchantIdError) {
      setInitError(`Configuration: ${merchantIdError}`);
    } else {
      setInitError(error);
    }
    setScriptLoaded(false);
    setIsInitializing(false);
  }, [merchantIdError]);
  
  const { loadScript, cleanupScript } = usePaiementProScript(
    onScriptLoaded,
    onScriptError
  );

  // Gérer l'ouverture de la boîte de dialogue
  useEffect(() => {
    if (open) {
      console.log("Dialog ouvert, réinitialisation de l'état");
      setIsInitialized(false);
      setIsInitializing(false);
      setInitError(null);
      setInitRetries(0);
      setScriptLoaded(false);
      
      // On charge directement le script sans délai pour accélérer le processus
      if (checkNetworkConnectivity()) {
        // Vérifier d'abord si le SDK est déjà chargé
        if (window.PaiementPro) {
          console.log("[PaiementPro] SDK déjà chargé dans window");
          onScriptLoaded();
        } else {
          loadScript();
        }
      }
    }
  }, [open, checkNetworkConnectivity, loadScript, setIsInitialized, onScriptLoaded]);

  // Gérer la fermeture de la boîte de dialogue
  useEffect(() => {
    if (!open) {
      console.log("[PaiementPro] Fermeture du dialog, nettoyage");
      setIsInitialized(false);
      setIsInitializing(false);
      setInitError(null);
      setInitRetries(0);
      setScriptLoaded(false);
      
      if (cleanupScript) {
        cleanupScript();
      }
    }
  }, [open, cleanupScript, setIsInitialized]);

  const handleRetryInit = useCallback(() => {
    console.log("Tentative de réinitialisation manuelle");
    setIsInitialized(false);
    setIsInitializing(false);
    setInitError(null);
    setInitRetries(prev => prev + 1);
    setScriptLoaded(false);
    
    // Nettoyer complètement et réessayer
    if (cleanupScript) {
      cleanupScript();
    }
    
    if (checkNetworkConnectivity()) {
      // Attente courte avant de réessayer
      setTimeout(() => loadScript(), 500);
    }
  }, [checkNetworkConnectivity, loadScript, setIsInitialized, cleanupScript]);

  return {
    isInitialized,
    isInitializing,
    initError,
    initRetries,
    handleRetryInit
  };
};
