
import { useState, useCallback } from "react";
import { PAIEMENT_PRO_CONFIG } from "@/config/payment";

interface InitOptions {
  merchantId: string;
  amount: number;
  description: string;
  callbackUrl: string;
  sandboxMode?: boolean;
  clientInfo?: {
    version: string;
    platform: string;
    userAgent: string;
    language: string;
  };
  currency?: string;
  customData?: any;
  themeColor?: string;
  logoUrl?: string;
  paymentMethods?: string[];
}

export const usePaiementProInit = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  
  const initializeSdk = useCallback((options: InitOptions) => {
    if (!window.PaiementPro) {
      throw new Error("SDK PaiementPro non chargé");
    }

    // Options d'initialisation selon la documentation
    const initOptions = {
      merchantId: options.merchantId,
      amount: options.amount,
      description: options.description,
      callbackUrl: options.callbackUrl,
      sandboxMode: options.sandboxMode !== undefined ? options.sandboxMode : PAIEMENT_PRO_CONFIG.SANDBOX_MODE,
      clientInfo: options.clientInfo || {
        version: PAIEMENT_PRO_CONFIG.VERSION,
        platform: navigator.platform,
        userAgent: navigator.userAgent.substring(0, 100),
        language: navigator.language
      },
      debug: PAIEMENT_PRO_CONFIG.DEBUG,
      currency: options.currency || 'XOF', // XOF selon la doc par défaut
      customData: options.customData,
      themeColor: options.themeColor,
      logoUrl: options.logoUrl,
      paymentMethods: options.paymentMethods
    };

    console.log("Initialisation du SDK avec les options:", {
      ...initOptions,
      merchantId: initOptions.merchantId.substring(0, 5) + "..." // Masquer l'ID complet
    });

    try {
      // Initialisation du SDK selon les spécifications
      window.PaiementPro.init(initOptions);
      
      // Vérifier si le SDK a bien été initialisé
      if (typeof window.PaiementPro.startPayment !== 'function') {
        throw new Error("Initialisation incomplète du SDK");
      }
      
      // Vérifications et logs supplémentaires
      if (window.PaiementPro.isReady) {
        console.log("État du SDK:", window.PaiementPro.isReady);
      }
      
      if (window.PaiementPro.version) {
        console.log("Version du SDK:", window.PaiementPro.version);
      }

      // Succès de l'initialisation
      setIsInitialized(true);
    } catch (error) {
      console.error("Erreur lors de l'initialisation du SDK:", error);
      throw error;
    }
  }, []);

  return {
    isInitialized,
    initializeSdk,
    setIsInitialized
  };
};
