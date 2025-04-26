
interface PaiementProInitOptions {
  merchantId: string;
  amount: number;
  channel: string;
  referenceNumber: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastname: string;
  customerPhoneNumber: string;
  description: string;
  countryCurrencyCode?: string;
  notificationURL?: string;
  returnURL?: string;
  returnContext?: string;
}

interface PaiementPro {
  merchantId: string;
  amount: number;
  channel: string;
  referenceNumber: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastname: string;
  customerPhoneNumber: string;
  description: string;
  countryCurrencyCode?: string;
  notificationURL?: string;
  returnURL?: string;
  returnContext?: string;
  success?: boolean;
  url?: string;
  getUrlPayment(): Promise<void>;
}

// Define the global PaiementPro interface based on the actual library
interface Window {
  PaiementPro: {
    new (merchantId: string): PaiementPro;
    init?(options: any): void;
    startPayment?(): void;
    isReady?: boolean;
    version?: string;
  }
}
