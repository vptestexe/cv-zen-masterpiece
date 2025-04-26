
/**
 * Configuration PaiementPro selon la documentation officielle
 * Documentation: https://www.paiementpro.net/documentation/
 */
export const PAIEMENT_PRO_CONFIG = {
  SCRIPT_URL: "https://www.paiementpro.net/webservice/onlinepayment/js/paiementpro.v1.0.1.js",
  TIMEOUT: 10000,        // 10 secondes
  DEBUG: true,
  SANDBOX_MODE: true,    // Mode sandbox pour les tests
  VERSION: '1.0.1',      // Version exacte selon la documentation
  CURRENCY_CODE: '952',  // Code devise FCFA XOF
  PAYMENT_CHANNEL: 'CARD', // Canal de paiement par défaut
  SCRIPT_ID: 'paiementpro-js-sdk',
  SCRIPT_ATTRIBUTES: {
    'data-version': '1.0.1',
    'data-mode': 'production'
  }
};

