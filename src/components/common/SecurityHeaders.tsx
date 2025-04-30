
import { useEffect } from "react";

const SecurityHeaders = () => {
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.info("En production, il est recommandé d'ajouter des headers de sécurité côté serveur:");
      console.info("1. Content-Security-Policy");
      console.info("2. X-XSS-Protection");
      console.info("3. X-Content-Type-Options");
      console.info("4. Referrer-Policy");
    }
  }, []);
  
  return null;
};

export default SecurityHeaders;
