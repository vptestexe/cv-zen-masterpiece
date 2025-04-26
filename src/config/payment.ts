
export const PAIEMENT_PRO_CONFIG = {
  SCRIPT_URLS: [
    "https://js.paiementpro.net/v1/paiementpro.js", // Changé en .js au lieu de .min.js
    "https://cdn.paiementpro.net/v1/paiementpro.js",
    "https://static.paiementpro.net/v1/paiementpro.js",
    "https://assets.paiementpro.net/sdk/latest/paiementpro.js"
  ],
  TIMEOUT: 20000,        // 20 secondes (augmenté)
  MAX_RETRIES: 3,        // Réduire encore le nombre de tentatives
  RETRY_DELAY: 3000,     // Délai initial entre les tentatives (augmenté)
  DEBUG: true,
  SANDBOX_MODE: true,
  HEALTH_CHECK_TIMEOUT: 5000, // Augmenté pour être plus patient
  LOG_LEVEL: 'debug',
  VERSION: '1.0.5',      // Version mise à jour
  AUTO_LOAD: true,       // Activation du chargement automatique selon la doc
  ENABLE_INIT_TRACING: true, // Pour le débogage supplémentaire
  SCRIPT_ID: 'paiementpro-js-sdk' // ID unique pour le script
};
