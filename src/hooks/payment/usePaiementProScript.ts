
import { useRef, useEffect } from "react";

export const usePaiementProScript = (
  onLoad: () => void,
  onError: (error: string) => void
) => {
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  const loadScript = () => {
    console.log("Chargement dynamique du script PaiementPro");
    
    const oldScript = document.querySelector('script[src*="paiementpro.min.js"]');
    if (oldScript) {
      console.log("Suppression de l'ancien script PaiementPro");
      oldScript.remove();
    }
    
    const script = document.createElement('script');
    script.src = "https://js.paiementpro.net/v1/paiementpro.min.js";
    script.defer = true;
    script.async = true;
    
    script.onload = () => {
      console.log("Script PaiementPro chargé avec succès");
      setTimeout(() => {
        if (window.PaiementPro) {
          console.log("SDK PaiementPro détecté dans window");
          onLoad();
        } else {
          console.error("Script chargé mais SDK PaiementPro non détecté dans window");
          onError("Le SDK PaiementPro n'a pas pu être chargé correctement");
        }
      }, 500);
    };
    
    script.onerror = () => {
      console.error("Erreur lors du chargement du script PaiementPro");
      onError("Impossible de charger le script PaiementPro");
    };
    
    document.body.appendChild(script);
    scriptRef.current = script;
  };

  const cleanupScript = () => {
    if (scriptRef.current) {
      scriptRef.current.remove();
      scriptRef.current = null;
    }
  };

  return { loadScript, cleanupScript };
};
