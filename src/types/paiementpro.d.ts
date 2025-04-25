
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
}

interface PaiementProSDK {
  init: (options: PaiementProInitOptions) => void;
  startPayment: () => void;
  getStatus?: () => string;
  version?: string;
  isReady?: boolean;
}

interface Window {
  PaiementPro: PaiementProSDK;
}

