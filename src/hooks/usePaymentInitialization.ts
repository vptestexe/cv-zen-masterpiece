
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UsePaymentInitializationReturn {
  isInitialized: boolean;
  isInitializing: boolean;
  initError: string | null;
  initRetries: number;
  handleRetryInit: () => void;
}

export const usePaymentInitialization = (open: boolean): UsePaymentInitializationReturn => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [initRetries, setInitRetries] = useState(0);
  const { toast } = useToast();
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const merchantIdRef = useRef<string | null>(null);
  const MAX_RETRIES = 3;

  useEffect(() => {
    if (!open) {
      setIsInitialized(false);
      setIsInitializing(false);
      setInitError(null);
      setInitRetries(0);
      merchantIdRef.current = null;
    }
  }, [open]);

  const initializePaiementPro = async () => {
    if (isInitializing) return;
    
    setIsInitializing(true);
    setInitError(null);
    
    console.log("Tentative d'initialisation PaiementPro...", { retries: initRetries });
    
    try {
      if (!window.PaiementPro) {
        throw new Error("SDK PaiementPro non chargé");
      }

      let merchantId = merchantIdRef.current;
      
      if (!merchantId) {
        console.log("Récupération de l'ID marchand depuis Supabase");
        const { data: secretData, error: secretError } = await supabase.functions.invoke(
          "get-payment-config",
          {
            body: { secret_name: "PAIEMENTPRO_MERCHANT_ID" }
          }
        );
        
        if (secretError || !secretData?.value) {
          console.error("Erreur de récupération de l'ID marchand:", secretError);
          throw new Error("ID marchand non configuré. Veuillez vérifier vos paramètres.");
        }
        
        merchantId = secretData.value;
        merchantIdRef.current = merchantId;
      }

      console.log("Initialisation PaiementPro avec ID marchand...");
      
      window.PaiementPro.init({
        merchantId: merchantId,
        amount: 1000,
        description: "Téléchargement CV",
        callbackUrl: window.location.origin + "/dashboard",
      });

      if (typeof window.PaiementPro.startPayment !== 'function') {
        throw new Error("Initialisation incomplète du SDK");
      }

      setIsInitialized(true);
      setIsInitializing(false);
      console.log("PaiementPro initialisé avec succès");
    } catch (error) {
      console.error("Erreur d'initialisation PaiementPro:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      setInitError(errorMessage);
      
      if (initRetries < MAX_RETRIES) {
        const nextRetry = initRetries + 1;
        setInitRetries(nextRetry);
        
        const retryDelay = 3000 * (nextRetry);
        console.log(`Réessai d'initialisation (${nextRetry}/${MAX_RETRIES}) dans ${retryDelay/1000}s...`);
        
        setTimeout(() => {
          setIsInitializing(false);
          const oldScript = document.querySelector('script[src*="paiementpro.min.js"]');
          if (oldScript) {
            oldScript.remove();
          }
          
          const script = document.createElement('script');
          script.src = "https://js.paiementpro.net/v1/paiementpro.min.js";
          script.defer = true;
          script.async = true;
          document.body.appendChild(script);
          scriptRef.current = script;
          
          setTimeout(initializePaiementPro, 1000);
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
      
      const loadScript = () => {
        console.log("Chargement dynamique du script PaiementPro");
        
        const oldScript = document.querySelector('script[src*="paiementpro.min.js"]');
        if (oldScript) {
          console.log("Suppression de l'ancien script PaiementPro");
          oldScript.remove();
        }
        
        const script = document.createElement('script');
        script.src = "https://js.paiementpro.net/v1/paiementpro.min.js";
        script.defer = true;
        script.async = true;
        
        script.onload = () => {
          console.log("Script PaiementPro chargé avec succès");
          setTimeout(() => {
            if (window.PaiementPro) {
              console.log("SDK PaiementPro détecté dans window");
              initializePaiementPro();
            } else {
              console.error("Script chargé mais SDK PaiementPro non détecté dans window");
              setInitError("Le SDK PaiementPro n'a pas pu être chargé correctement");
            }
          }, 500);
        };
        
        script.onerror = () => {
          console.error("Erreur lors du chargement du script PaiementPro");
          setInitError("Impossible de charger le script PaiementPro");
        };
        
        document.body.appendChild(script);
        scriptRef.current = script;
      };
      
      const timer = setTimeout(() => {
        loadScript();
      }, 300);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [open, initRetries, toast]);

  const handleRetryInit = () => {
    console.log("Tentative de réinitialisation manuelle");
    setIsInitialized(false);
    setIsInitializing(false);
    setInitError(null);
    setInitRetries(0);
    
    const oldScript = document.querySelector('script[src*="paiementpro.min.js"]');
    if (oldScript) {
      oldScript.remove();
    }
    
    const script = document.createElement('script');
    script.src = "https://js.paiementpro.net/v1/paiementpro.min.js";
    script.defer = true;
    script.async = true;
    
    script.onload = () => {
      console.log("Script rechargé avec succès, initialisation dans 1s");
      setTimeout(initializePaiementPro, 1000);
    };
    
    document.body.appendChild(script);
    scriptRef.current = script;
  };

  return {
    isInitialized,
    isInitializing,
    initError,
    initRetries,
    handleRetryInit
  };
};
