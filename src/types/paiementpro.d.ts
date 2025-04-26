
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

interface Window {
  PaiementPro: {
    new (merchantId: string): PaiementPro;
  }
}
