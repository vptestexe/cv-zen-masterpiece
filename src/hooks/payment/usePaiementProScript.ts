
import { useRef, useEffect } from "react";
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

  const checkServiceAvailability = async (url: string): Promise<boolean> => {
    if (!navigator.onLine) return false;

    try {
      console.log(`[PaiementPro] Vérification de la disponibilité: ${url}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), PAIEMENT_PRO_CONFIG.HEALTH_CHECK_TIMEOUT);
      
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log(`[PaiementPro] Service disponible sur ${url}`);
      return true;
    } catch (error) {
      console.warn(`[PaiementPro] Service indisponible sur ${url}:`, error);
      return false;
    }
  };

  const loadScript = async () => {
    if (!navigator.onLine) {
      console.error("[PaiementPro] Pas de connexion internet");
      handleLoadError("Aucune connexion internet détectée");
      return;
    }

    attemptsRef.current++;
    console.log(`[PaiementPro] Tentative #${attemptsRef.current}/${PAIEMENT_PRO_CONFIG.MAX_RETRIES}`);

    // Cleanup old script if exists
    if (scriptRef.current) {
      console.log("[PaiementPro] Nettoyage de l'ancien script");
      scriptRef.current.remove();
      scriptRef.current = null;
    }

    // Check if SDK is already available
    if (window.PaiementPro) {
      console.log("[PaiementPro] SDK déjà chargé");
      try {
        onLoad();
        return;
      } catch (err) {
        console.error("[PaiementPro] Erreur avec le SDK existant:", err);
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
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";

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
          console.log("[PaiementPro] SDK initialisé avec succès");
          toast({
            title: "PaiementPro initialisé",
            description: "Le système de paiement est prêt",
          });
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

    document.body.appendChild(script);
    scriptRef.current = script;
  };

  const handleLoadError = (error: string) => {
    const canRetry = attemptsRef.current < PAIEMENT_PRO_CONFIG.MAX_RETRIES;
    const hasMoreUrls = urlIndexRef.current < PAIEMENT_PRO_CONFIG.SCRIPT_URLS.length - 1;

    if (hasMoreUrls) {
      urlIndexRef.current++;
      console.log(`[PaiementPro] Passage à l'URL suivante: ${PAIEMENT_PRO_CONFIG.SCRIPT_URLS[urlIndexRef.current]}`);
      setTimeout(loadScript, PAIEMENT_PRO_CONFIG.RETRY_DELAY);
    } else if (canRetry) {
      urlIndexRef.current = 0;
      const delay = PAIEMENT_PRO_CONFIG.RETRY_DELAY * Math.pow(1.5, attemptsRef.current - 1);
      console.log(`[PaiementPro] Nouvelle tentative dans ${delay/1000}s...`);
      setTimeout(loadScript, delay);
    } else {
      console.error("[PaiementPro] Échec après toutes les tentatives");
      onError(error);
      toast({
        title: "Erreur PaiementPro",
        description: "Impossible d'initialiser le système de paiement. Veuillez réessayer plus tard.",
        variant: "destructive",
      });
    }
  };

  const cleanupScript = () => {
    if (scriptRef.current) {
      console.log("[PaiementPro] Nettoyage du script lors du démontage");
      scriptRef.current.remove();
      scriptRef.current = null;
    }
    attemptsRef.current = 0;
    urlIndexRef.current = 0;
  };

  useEffect(() => {
    loadScript();
    return () => {
      cleanupScript();
    };
  }, []);

  return { loadScript, cleanupScript };
};
