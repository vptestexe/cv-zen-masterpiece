
interface PaiementProInitOptions {
  merchantId: string;
  amount: number;
  description: string;
  callbackUrl: string;
}

interface PaiementProSDK {
  init: (options: PaiementProInitOptions) => void;
  startPayment: () => void;
}

interface Window {
  PaiementPro: PaiementProSDK;
}
