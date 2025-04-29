
// Payment configuration
// This is a placeholder file since we're removing payment functionality
// It's kept to fix TypeScript errors in the existing code

export const PAIEMENT_PRO_CONFIG = {
  SCRIPT_ID: 'payment-script',
  SCRIPT_URLS: ['https://example.com/payment-stub.js'],
  SCRIPT_ATTRIBUTES: {},
  TIMEOUT: 5000,
  RETRY_DELAY: 2000,
  MAX_RETRIES: 3,
  USE_FALLBACK_IMMEDIATELY: true,
  SANDBOX_MODE: true,
  DEBUG: false,
  PAYMENT_CHANNEL: 'online',
  CURRENCY_CODE: 'XOF'
};

// Add global types for the payment SDK
declare global {
  interface Window {
    PaiementPro?: any;
    _paiementProInstance?: any;
  }
}
