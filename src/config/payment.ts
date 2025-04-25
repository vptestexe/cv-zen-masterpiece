
export const PAIEMENT_PRO_CONFIG = {
  SCRIPT_URLS: [
    "https://js.paiementpro.net/v1/paiementpro.min.js",
    "https://cdn.paiementpro.net/v1/paiementpro.min.js",
    "https://static.paiementpro.net/v1/paiementpro.min.js",
    "https://assets.paiementpro.net/sdk/latest/paiementpro.min.js"
  ],
  TIMEOUT: 15000,       // 15 secondes
  MAX_RETRIES: 5,      // Augmentation du nombre de tentatives
  RETRY_DELAY: 2000,    // Délai initial entre les tentatives réduit
  DEBUG: true,
  SANDBOX_MODE: true,
  HEALTH_CHECK_TIMEOUT: 4000, // Réduit pour accélérer les vérifications
  LOG_LEVEL: 'debug',
  VERSION: '1.0.1'      // Version mise à jour pour éviter les problèmes de cache
};
