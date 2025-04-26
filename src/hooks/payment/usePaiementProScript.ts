
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

  const checkServiceAvailability = async (url: string): Promise<boolean> => {
    if (!navigator.onLine) return false;

    try {
      console.log(`[PaiementPro] Vérification de la disponibilité: ${url}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), PAIEMENT_PRO_CONFIG.HEALTH_CHECK_TIMEOUT);
      
      // Utiliser une requête HEAD pour vérifier que le service est disponible
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
        cache: 'no-cache'
      });
      
      clearTimeout(timeoutId);
      console.log(`[PaiementPro] Service disponible sur ${url}`);
      return true;
    } catch (error) {
      console.warn(`[PaiementPro] Service indisponible sur ${url}:`, error);
      return false;
    }
  };

  const handleLoadError = useCallback((error: string) => {
    const canRetry = attemptsRef.current < PAIEMENT_PRO_CONFIG.MAX_RETRIES;
    const hasMoreUrls = urlIndexRef.current < PAIEMENT_PRO_CONFIG.SCRIPT_URLS.length - 1;
    scriptLoadingRef.current = false;

    if (hasMoreUrls) {
      urlIndexRef.current++;
      console.log(`[PaiementPro] Passage à l'URL suivante: ${PAIEMENT_PRO_CONFIG.SCRIPT_URLS[urlIndexRef.current]}`);
      setTimeout(() => loadScript(), PAIEMENT_PRO_CONFIG.RETRY_DELAY);
    } else if (canRetry) {
      urlIndexRef.current = 0;
      const delay = PAIEMENT_PRO_CONFIG.RETRY_DELAY * Math.pow(1.5, attemptsRef.current - 1);
      console.log(`[PaiementPro] Nouvelle tentative dans ${delay/1000}s...`);
      setTimeout(() => loadScript(), delay);
    } else {
      console.error("[PaiementPro] Échec après toutes les tentatives");
      onError("Impossible de charger le système de paiement après plusieurs tentatives.");
      toast({
        title: "Erreur de chargement",
        description: "Impossible d'initialiser le système de paiement. Veuillez réessayer plus tard.",
        variant: "destructive",
      });
    }
  }, [onError, toast]);

  const loadScript = useCallback(async () => {
    if (scriptLoadingRef.current) {
      console.log("[PaiementPro] Chargement de script déjà en cours, opération ignorée");
      return;
    }

    if (!navigator.onLine) {
      console.error("[PaiementPro] Pas de connexion internet");
      handleLoadError("Aucune connexion internet détectée");
      return;
    }

    // Vérifier avant d'incrémenter
    if (attemptsRef.current >= PAIEMENT_PRO_CONFIG.MAX_RETRIES) {
      console.error(`[PaiementPro] Limite de tentatives atteinte (${attemptsRef.current}/${PAIEMENT_PRO_CONFIG.MAX_RETRIES})`);
      handleLoadError("Limite de tentatives atteinte");
      return;
    }
    
    scriptLoadingRef.current = true;
    attemptsRef.current++;
    console.log(`[PaiementPro] Tentative #${attemptsRef.current}/${PAIEMENT_PRO_CONFIG.MAX_RETRIES}`);

    // Nettoyer les scripts existants
    const existingScripts = document.querySelectorAll(`script[src*="paiementpro"]`);
    existingScripts.forEach(script => script.remove());
    
    if (scriptRef.current) {
      console.log("[PaiementPro] Nettoyage de l'ancien script");
      scriptRef.current.remove();
      scriptRef.current = null;
    }

    // Vérifier si SDK est déjà disponible
    if (window.PaiementPro) {
      console.log("[PaiementPro] SDK déjà chargé");
      try {
        onLoad();
        scriptLoadingRef.current = false;
        return;
      } catch (err) {
        console.error("[PaiementPro] Erreur avec le SDK existant:", err);
        // Réinitialiser l'objet global
        window.PaiementPro = undefined;
      }
    }

    const currentUrl = PAIEMENT_PRO_CONFIG.SCRIPT_URLS[urlIndexRef.current];
    console.log(`[PaiementPro] Tentative de chargement depuis ${currentUrl}`);

    // Vérifier la disponibilité du service
    const isAvailable = await checkServiceAvailability(currentUrl);
    if (!isAvailable) {
      handleLoadError(`Service indisponible sur ${new URL(currentUrl).hostname}`);
      return;
    }

    const script = document.createElement('script');
    script.src = currentUrl;
    script.id = PAIEMENT_PRO_CONFIG.SCRIPT_ID; // ID unique selon la doc
    script.async = true;
    script.defer = false; // Changé selon la doc
    script.crossOrigin = "anonymous";
    
    // Attributs selon la documentation
    script.setAttribute('data-version', PAIEMENT_PRO_CONFIG.VERSION);
    script.setAttribute('data-timestamp', Date.now().toString());
    script.setAttribute('data-sandbox', PAIEMENT_PRO_CONFIG.SANDBOX_MODE ? 'true' : 'false');
    script.setAttribute('data-auto-load', PAIEMENT_PRO_CONFIG.AUTO_LOAD ? 'true' : 'false');
    script.setAttribute('data-debug', PAIEMENT_PRO_CONFIG.DEBUG ? 'true' : 'false');

    const timeoutId = setTimeout(() => {
      if (scriptRef.current === script) {
        console.error(`[PaiementPro] Délai dépassé pour ${currentUrl}`);
        handleLoadError("Délai de chargement dépassé");
      }
    }, PAIEMENT_PRO_CONFIG.TIMEOUT);

    script.onload = () => {
      clearTimeout(timeoutId);
      console.log(`[PaiementPro] Script chargé depuis ${currentUrl}`);
      
      // Vérification différée de l'initialisation du SDK
      setTimeout(() => {
        if (window.PaiementPro) {
          console.log("[PaiementPro] SDK initialisé avec succès", window.PaiementPro);
          toast({
            title: "PaiementPro initialisé",
            description: "Le système de paiement est prêt",
          });
          scriptLoadingRef.current = false;
          onLoad();
        } else {
          console.error("[PaiementPro] SDK non initialisé après chargement");
          handleLoadError("Échec d'initialisation du SDK");
        }
      }, 500);
    };

    script.onerror = () => {
      clearTimeout(timeoutId);
      console.error(`[PaiementPro] Erreur de chargement depuis ${currentUrl}`);
      handleLoadError(`Échec de chargement depuis ${new URL(currentUrl).hostname}`);
    };

    // Ajouter à la fin du head selon la doc
    document.head.appendChild(script);
    scriptRef.current = script;
  }, [handleLoadError, onLoad, toast]);

  const cleanupScript = useCallback(() => {
    if (scriptRef.current) {
      console.log("[PaiementPro] Nettoyage du script lors du démontage");
      scriptRef.current.remove();
      scriptRef.current = null;
    }
    
    // Nettoyer tous les scripts PaiementPro
    document.querySelectorAll(`script[id="${PAIEMENT_PRO_CONFIG.SCRIPT_ID}"]`).forEach(
      script => script.remove()
    );
    
    scriptLoadingRef.current = false;
    attemptsRef.current = 0;
    urlIndexRef.current = 0;
    
    // Nettoyage de l'objet global
    if (window.PaiementPro) {
      console.log("[PaiementPro] Réinitialisation de l'objet global PaiementPro");
      window.PaiementPro = undefined;
    }
  }, []);

  useEffect(() => {
    // Ne pas charger automatiquement sauf si configuré
    if (PAIEMENT_PRO_CONFIG.AUTO_LOAD) {
      console.log("[PaiementPro] Chargement automatique activé, initialisation...");
      loadScript();
    } else {
      console.log("[PaiementPro] Chargement automatique désactivé, attendant une demande explicite");
    }
    
    return () => {
      cleanupScript();
    };
  }, [cleanupScript, loadScript]);

  return { loadScript, cleanupScript };
};
