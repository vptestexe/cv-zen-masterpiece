
import { useRef, useEffect } from "react";
import { PAIEMENT_PRO_CONFIG } from "@/config/payment";

export const usePaiementProScript = (
  onLoad: () => void,
  onError: (error: string) => void
) => {
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const attemptsRef = useRef(0);
  const urlIndexRef = useRef(0);

  const loadScript = () => {
    console.log("Tentative de chargement du script PaiementPro");
    
    // Incrémenter le nombre de tentatives
    attemptsRef.current += 1;
    console.log(`Tentative #${attemptsRef.current}`);
    
    // Nettoyer les anciens scripts
    const oldScript = document.querySelector('script[src*="paiementpro"]');
    if (oldScript) {
      console.log("Suppression de l'ancien script PaiementPro");
      oldScript.remove();
    }
    
    // Vérifier si window.PaiementPro existe déjà
    if (window.PaiementPro) {
      console.log("PaiementPro déjà disponible dans window");
      try {
        onLoad();
        return;
      } catch (err) {
        console.error("Échec d'utilisation du PaiementPro existant:", err);
      }
    }
    
    // Créer un nouveau script
    const script = document.createElement('script');
    const currentUrl = PAIEMENT_PRO_CONFIG.SCRIPT_URLS[urlIndexRef.current];
    
    script.src = currentUrl;
    script.defer = true;
    script.async = true;
    
    // Définir un délai maximum pour le chargement du script
    const timeoutId = setTimeout(() => {
      if (scriptRef.current === script) {
        console.error(`Délai dépassé pour l'URL: ${currentUrl}`);
        handleScriptError();
      }
    }, PAIEMENT_PRO_CONFIG.TIMEOUT);
    
    script.onload = () => {
      console.log(`Script PaiementPro chargé avec succès depuis ${currentUrl}`);
      clearTimeout(timeoutId);
      
      setTimeout(() => {
        if (window.PaiementPro) {
          console.log("SDK PaiementPro détecté dans window");
          onLoad();
        } else {
          console.error("Script chargé mais SDK non détecté");
          handleScriptError();
        }
      }, 500);
    };
    
    script.onerror = () => {
      clearTimeout(timeoutId);
      console.error(`Erreur lors du chargement depuis ${currentUrl}`);
      handleScriptError();
    };
    
    document.body.appendChild(script);
    scriptRef.current = script;
  };

  const handleScriptError = () => {
    // Essayer l'URL suivante si disponible
    if (urlIndexRef.current < PAIEMENT_PRO_CONFIG.SCRIPT_URLS.length - 1) {
      urlIndexRef.current += 1;
      console.log(`Tentative avec l'URL de secours: ${PAIEMENT_PRO_CONFIG.SCRIPT_URLS[urlIndexRef.current]}`);
      setTimeout(loadScript, PAIEMENT_PRO_CONFIG.RETRY_DELAY);
    } else if (attemptsRef.current < PAIEMENT_PRO_CONFIG.MAX_RETRIES) {
      // Réinitialiser l'index d'URL et réessayer
      urlIndexRef.current = 0;
      setTimeout(loadScript, PAIEMENT_PRO_CONFIG.RETRY_DELAY);
    } else {
      console.error("Échec du chargement après toutes les tentatives");
      onError("Impossible de charger le système de paiement. Veuillez vérifier votre connexion internet ou contacter le support.");
    }
  };

  const cleanupScript = () => {
    if (scriptRef.current) {
      scriptRef.current.remove();
      scriptRef.current = null;
    }
    attemptsRef.current = 0;
    urlIndexRef.current = 0;
  };

  return { loadScript, cleanupScript };
};
