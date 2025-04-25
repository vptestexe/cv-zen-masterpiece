
export const PAIEMENT_PRO_CONFIG = {
  SCRIPT_URLS: [
    "https://js.paiementpro.net/v1/paiementpro.min.js",
    "https://cdn.paiementpro.net/v1/paiementpro.min.js", // URL de secours
  ],
  TIMEOUT: 15000, // 15 secondes
  MAX_RETRIES: 3,
  RETRY_DELAY: 3000, // 3 secondes entre les tentatives
};
