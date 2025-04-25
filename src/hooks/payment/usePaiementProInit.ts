
import { useState } from "react";

interface InitOptions {
  merchantId: string;
  amount: number;
  description: string;
  callbackUrl: string;
}

export const usePaiementProInit = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  
  const initializeSdk = (options: InitOptions) => {
    if (!window.PaiementPro) {
      throw new Error("SDK PaiementPro non chargé");
    }

    window.PaiementPro.init(options);

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
