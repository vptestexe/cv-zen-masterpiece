
export const PAIEMENT_PRO_CONFIG = {
  SCRIPT_URLS: [
    "https://js.paiementpro.net/v1/paiementpro.min.js",
    "https://cdn.paiementpro.net/v1/paiementpro.min.js",
    "https://static.paiementpro.net/v1/paiementpro.min.js", // URL supplémentaire
    "https://assets.paiementpro.net/sdk/latest/paiementpro.min.js" // URL alternative
  ],
  TIMEOUT: 30000, // Augmenté à 30 secondes
  MAX_RETRIES: 5, // Augmenté à 5 tentatives
  RETRY_DELAY: 2000, // Réduit à 2 secondes entre les tentatives
  DEBUG: true, // Mode debug pour plus d'informations
  SANDBOX_MODE: true // Mode sandbox pour le développement
};
