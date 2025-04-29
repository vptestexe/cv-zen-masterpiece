
// Type definitions for payment related globals
// This is a stub file as we're removing payment functionality

interface PaiementProInstance {
  amount: number;
  channel: string;
  referenceNumber: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastname: string;
  customerPhoneNumber: string;
  description: string;
  countryCurrencyCode: string;
  notificationURL?: string;
  returnURL?: string;
}

declare global {
  interface Window {
    PaiementPro?: new (merchantId: string) => PaiementProInstance;
    _paiementProInstance?: PaiementProInstance;
  }
}

export {};
