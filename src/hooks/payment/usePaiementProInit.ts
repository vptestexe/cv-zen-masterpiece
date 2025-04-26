
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
  
  // Fonction d'initialisation basée sur l'exemple
  const initializeSdk = useCallback((options: InitOptions) => {
    if (!window.PaiementPro) {
      throw new Error("SDK PaiementPro non chargé");
    }

    try {
      console.log("Initialisation du SDK avec les options:", {
        ...options,
        merchantId: options.merchantId.substring(0, 5) + "..." // Masquer l'ID complet
      });

      // Créer une nouvelle instance selon l'exemple fourni
      const paiementPro = new window.PaiementPro(options.merchantId);
      
      // Définir les paramètres selon l'exemple
      paiementPro.amount = options.amount;
      paiementPro.channel = PAIEMENT_PRO_CONFIG.PAYMENT_CHANNEL;
      paiementPro.referenceNumber = 'TXN-' + Date.now(); // Générer une référence unique
      paiementPro.customerEmail = 'client@example.com'; // Valeur par défaut
      paiementPro.customerFirstName = 'Prénom';
      paiementPro.customerLastname = 'Nom'; // Noter la minuscule sur "lastname" selon l'exemple
      paiementPro.customerPhoneNumber = '0102030405';
      paiementPro.description = options.description;
      paiementPro.countryCurrencyCode = options.currency || PAIEMENT_PRO_CONFIG.CURRENCY_CODE;
      
      // URLs optionnelles mais recommandées
      if (options.callbackUrl) {
        const baseUrl = new URL(options.callbackUrl).origin;
        paiementPro.notificationURL = `${baseUrl}/api/payment/notify`;
        paiementPro.returnURL = options.callbackUrl;
      }
      
      // Succès de l'initialisation
      console.log("Instance PaiementPro créée avec succès");
      setIsInitialized(true);
      
      // Stocker l'instance pour un accès global
      window._paiementProInstance = paiementPro;
      
      return paiementPro;
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

// Augmenter la fenêtre pour stocker l'instance PaiementPro
declare global {
  interface Window {
    _paiementProInstance?: any;
  }
}
