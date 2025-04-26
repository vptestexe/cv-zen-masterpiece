
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
  currency?: string;       // XOF par défaut selon la doc
  customData?: any;        // Données personnalisées
  themeColor?: string;     // Couleur du thème
  logoUrl?: string;        // URL du logo
  paymentMethods?: string[]; // Méthodes de paiement acceptées
}

interface PaiementProEvent {
  type: string;
  data: any;
}

interface PaiementProEventListener {
  (event: PaiementProEvent): void;
}

interface PaiementProTransaction {
  id: string;
  status: string;
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
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
  getTransaction?: () => PaiementProTransaction;
}

interface Window {
  PaiementPro: PaiementProSDK;
}
