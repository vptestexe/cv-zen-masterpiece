
export const PAIEMENT_PRO_CONFIG = {
  SCRIPT_URLS: [
    "https://js.paiementpro.net/v1/paiementpro.min.js",
    "https://cdn.paiementpro.net/v1/paiementpro.min.js",
    "https://static.paiementpro.net/v1/paiementpro.min.js",
    "https://assets.paiementpro.net/sdk/latest/paiementpro.min.js"
  ],
  TIMEOUT: 15000, // 15 secondes
  MAX_RETRIES: 3,
  RETRY_DELAY: 3000,
  DEBUG: true,
  SANDBOX_MODE: true,
  HEALTH_CHECK_TIMEOUT: 5000,
  LOG_LEVEL: 'debug',
  VERSION: '1.0.0'
};

