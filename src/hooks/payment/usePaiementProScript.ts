
import { useRef, useEffect, useCallback } from "react";
import { PAIEMENT_PRO_CONFIG } from "@/config/payment";
import { useToast } from "@/hooks/use-toast";

export const usePaiementProScript = (
  onLoad: () => void,
  onError: (error: string) => void
) => {
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const attemptsRef = useRef(0);
  const urlIndexRef = useRef(0);
  const { toast } = useToast();
  const scriptLoadingRef = useRef(false);

  // Fonction de chargement du script
  const loadScript = useCallback(() => {
    if (scriptLoadingRef.current) {
      console.log("[PaiementPro] Chargement de script déjà en cours");
      return;
    }

    // Vérification de la connexion internet
    if (!navigator.onLine) {
      console.error("[PaiementPro] Pas de connexion internet");
      onError("Aucune connexion internet détectée");
      return;
    }
    
    // Vérification du nombre maximum de tentatives
    if (attemptsRef.current >= PAIEMENT_PRO_CONFIG.MAX_RETRIES) {
      console.error(`[PaiementPro] Limite de tentatives atteinte (${attemptsRef.current}/${PAIEMENT_PRO_CONFIG.MAX_RETRIES})`);
      onError("Limite de tentatives atteinte");
      return;
    }
    
    scriptLoadingRef.current = true;

    // Nettoyer les scripts existants
    const existingScripts = document.querySelectorAll(`script[id="${PAIEMENT_PRO_CONFIG.SCRIPT_ID}"]`);
    existingScripts.forEach(script => script.remove());
    
    if (scriptRef.current) {
      scriptRef.current.remove();
      scriptRef.current = null;
    }

    // Vérifier si le SDK est déjà chargé
    if (window.PaiementPro) {
      console.log("[PaiementPro] SDK déjà chargé");
      onLoad();
      scriptLoadingRef.current = false;
      return;
    }

    // Sélection de l'URL à utiliser
    const currentUrl = PAIEMENT_PRO_CONFIG.SCRIPT_URLS[urlIndexRef.current];
    console.log(`[PaiementPro] Tentative #${attemptsRef.current + 1}/${PAIEMENT_PRO_CONFIG.MAX_RETRIES} - URL: ${currentUrl}`);

    // Création du script
    const script = document.createElement('script');
    script.src = currentUrl;
    script.id = PAIEMENT_PRO_CONFIG.SCRIPT_ID;
    script.async = true;
    script.defer = true; // Selon l'exemple HTML
    script.type = 'text/javascript'; // Selon l'exemple HTML
    
    // Attributs supplémentaires
    Object.entries(PAIEMENT_PRO_CONFIG.SCRIPT_ATTRIBUTES).forEach(([key, value]) => {
      script.setAttribute(key, value);
    });

    // Gestion du timeout
    const timeoutId = setTimeout(() => {
      if (scriptRef.current === script) {
        console.error(`[PaiementPro] Délai dépassé pour ${currentUrl}`);
        handleScriptError("Délai de chargement dépassé");
      }
    }, PAIEMENT_PRO_CONFIG.TIMEOUT);

    // Gestionnaires d'événements
    script.onload = () => {
      clearTimeout(timeoutId);
      console.log(`[PaiementPro] Script chargé depuis ${currentUrl}`);
      
      // Vérification différée de l'objet global
      setTimeout(() => {
        if (window.PaiementPro) {
          console.log("[PaiementPro] SDK disponible globalement");
          scriptLoadingRef.current = false;
          onLoad();
        } else {
          console.error("[PaiementPro] SDK non disponible après chargement");
          handleScriptError("SDK non disponible après chargement");
        }
      }, 500);
    };

    script.onerror = () => {
      clearTimeout(timeoutId);
      console.error(`[PaiementPro] Erreur de chargement depuis ${currentUrl}`);
      handleScriptError(`Échec de chargement depuis ${new URL(currentUrl).hostname}`);
    };

    // Ajouter à la tête du document comme dans l'exemple HTML
    document.head.appendChild(script);
    scriptRef.current = script;
    attemptsRef.current++;
    
    // Fonction de gestion des erreurs
    function handleScriptError(error: string) {
      const canRetry = attemptsRef.current < PAIEMENT_PRO_CONFIG.MAX_RETRIES;
      const hasMoreUrls = urlIndexRef.current < PAIEMENT_PRO_CONFIG.SCRIPT_URLS.length - 1;
      scriptLoadingRef.current = false;

      if (hasMoreUrls) {
        urlIndexRef.current++;
        console.log(`[PaiementPro] Passage à l'URL suivante: ${PAIEMENT_PRO_CONFIG.SCRIPT_URLS[urlIndexRef.current]}`);
        setTimeout(() => loadScript(), PAIEMENT_PRO_CONFIG.RETRY_DELAY);
      } else if (canRetry) {
        attemptsRef.current++;
        urlIndexRef.current = 0;
        console.log(`[PaiementPro] Nouvelle tentative #${attemptsRef.current}`);
        setTimeout(() => loadScript(), PAIEMENT_PRO_CONFIG.RETRY_DELAY);
      } else {
        console.error("[PaiementPro] Échec après toutes les tentatives");
        onError(error);
      }
    }
  }, [onError, onLoad]);

  // Fonction de nettoyage
  const cleanupScript = useCallback(() => {
    if (scriptRef.current) {
      scriptRef.current.remove();
      scriptRef.current = null;
    }
    
    // Nettoyer les scripts existants
    document.querySelectorAll(`script[id="${PAIEMENT_PRO_CONFIG.SCRIPT_ID}"]`).forEach(
      script => script.remove()
    );
    
    scriptLoadingRef.current = false;
    attemptsRef.current = 0;
    urlIndexRef.current = 0;
    
    // Nettoyer l'instance globale
    delete window._paiementProInstance;
  }, []);

  // Nettoyage lors du démontage
  useEffect(() => {
    return () => {
      cleanupScript();
    };
  }, [cleanupScript]);

  return { loadScript, cleanupScript };
};
