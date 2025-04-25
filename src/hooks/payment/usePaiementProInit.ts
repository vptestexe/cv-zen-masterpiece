
import { useState } from "react";

interface InitOptions {
  merchantId: string;
  amount: number;
  description: string;
  callbackUrl: string;
  sandboxMode?: boolean;
}

export const usePaiementProInit = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  
  const initializeSdk = (options: InitOptions) => {
    if (!window.PaiementPro) {
      throw new Error("SDK PaiementPro non chargé");
    }

    const initOptions = {
      ...options,
      // Ajouter des informations de diagnostic
      clientInfo: {
        version: "1.0.0",
        platform: navigator.platform,
        userAgent: navigator.userAgent.substring(0, 100), // Tronquer pour éviter les limites
        language: navigator.language
      }
    };

    console.log("Initialisation du SDK avec les options:", {
      ...initOptions,
      merchantId: initOptions.merchantId.substring(0, 5) + "..." // Masquer l'ID complet pour sécurité
    });

    window.PaiementPro.init(initOptions);

    if (typeof window.PaiementPro.startPayment !== 'function') {
      throw new Error("Initialisation incomplète du SDK");
    }

    setIsInitialized(true);
  };

  return {
    isInitialized,
    initializeSdk,
    setIsInitialized
  };
};
