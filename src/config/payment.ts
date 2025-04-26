
/**
 * Configuration PaiementPro selon les spécifications de la documentation officielle
 * Documentation: https://dashboard.paiementpro.net/_files/PaiementPro-JS-V1.0.1.pdf
 */
export const PAIEMENT_PRO_CONFIG = {
  SCRIPT_URLS: [
    "https://js.paiementpro.net/v1/paiementpro.min.js", // URL principale selon la documentation
    "https://cdn.paiementpro.net/v1/paiementpro.min.js", // URL de secours
    "https://static.paiementpro.net/v1/paiementpro.min.js", // URL de secours
    "https://assets.paiementpro.net/sdk/latest/paiementpro.min.js" // URL de secours
  ],
  TIMEOUT: 10000,        // 10 secondes (selon doc)
  MAX_RETRIES: 2,        // Réduire le nombre de tentatives (éviter trop d'erreurs)
  RETRY_DELAY: 2000,     // 2 secondes entre les tentatives
  DEBUG: true,
  SANDBOX_MODE: true,    // Mode sandbox pour les tests
  HEALTH_CHECK_TIMEOUT: 3000,
  LOG_LEVEL: 'debug',
  VERSION: '1.0.1',      // Version exacte selon la documentation
  AUTO_LOAD: false,      // Désactivé pour contrôler nous-mêmes le chargement
  ENABLE_INIT_TRACING: true,
  SCRIPT_ID: 'paiementpro-js-sdk',
  SCRIPT_ATTRIBUTES: {   // Attributs spécifiques selon la documentation
    'data-mode': 'production',
    'data-auto-initialize': 'false'
  }
};
