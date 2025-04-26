
interface PaiementProInitOptions {
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
  debug?: boolean;
  currency?: string;      // Devise (XOF par défaut)
  customData?: any;       // Données personnalisées 
  themeColor?: string;    // Couleur du thème
  logoUrl?: string;       // URL du logo
  paymentMethods?: string[]; // Méthodes de paiement acceptées
}

interface PaiementProEvent {
  type: string;
  data: any;
}

interface PaiementProEventListener {
  (event: PaiementProEvent): void;
}

interface PaiementProSDK {
  init: (options: PaiementProInitOptions) => void;
  startPayment: () => void;
  getStatus?: () => string;
  version?: string;
  isReady?: boolean;
  addEventListener?: (eventName: string, callback: PaiementProEventListener) => void;
  removeEventListener?: (eventName: string, callback: PaiementProEventListener) => void;
  cancel?: () => void;
}

interface Window {
  PaiementPro: PaiementProSDK;
}
