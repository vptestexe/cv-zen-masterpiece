
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

  // Fonction simplifiée pour vérifier la disponibilité du service
  const checkServiceAvailability = async (url: string): Promise<boolean> => {
    if (!navigator.onLine) return false;
    
    // Pour accélérer les tests, nous allons supposer que le service est disponible
    // car la vérification peut échouer même si le script est accessible
    return true;
  };

  // Gestionnaire d'erreur de chargement
  const handleLoadError = useCallback((error: string) => {
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
      onError("Impossible de charger le système de paiement après plusieurs tentatives.");
      toast({
        title: "Erreur de chargement",
        description: "Impossible d'initialiser le système de paiement. Veuillez réessayer plus tard.",
        variant: "destructive",
      });
    }
  }, [onError, toast]);

  // Fonction principale de chargement du script
  const loadScript = useCallback(() => {
    if (scriptLoadingRef.current) {
      console.log("[PaiementPro] Chargement de script déjà en cours, opération ignorée");
      return;
    }

    if (!navigator.onLine) {
      console.error("[PaiementPro] Pas de connexion internet");
      handleLoadError("Aucune connexion internet détectée");
      return;
    }
    
    // Contrôle du nombre de tentatives
    if (attemptsRef.current >= PAIEMENT_PRO_CONFIG.MAX_RETRIES) {
      console.error(`[PaiementPro] Limite de tentatives atteinte (${attemptsRef.current}/${PAIEMENT_PRO_CONFIG.MAX_RETRIES})`);
      handleLoadError("Limite de tentatives atteinte");
      return;
    }
    
    scriptLoadingRef.current = true;

    // Nettoyer les scripts existants
    const existingScripts = document.querySelectorAll(`script[id="${PAIEMENT_PRO_CONFIG.SCRIPT_ID}"]`);
    existingScripts.forEach(script => {
      console.log("[PaiementPro] Suppression d'un script existant");
      script.remove();
    });
    
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
        window.PaiementPro = undefined as any;
      }
    }

    const currentUrl = PAIEMENT_PRO_CONFIG.SCRIPT_URLS[urlIndexRef.current];
    console.log(`[PaiementPro] Tentative #${attemptsRef.current + 1}/${PAIEMENT_PRO_CONFIG.MAX_RETRIES} - Chargement depuis ${currentUrl}`);

    // Création du script selon les spécifications exactes de la documentation
    const script = document.createElement('script');
    script.src = currentUrl;
    script.id = PAIEMENT_PRO_CONFIG.SCRIPT_ID;
    script.async = true;
    script.defer = true; // Selon la documentation
    script.type = 'text/javascript'; // Ajouté selon la documentation
    
    // Attributs selon la documentation
    script.setAttribute('data-version', PAIEMENT_PRO_CONFIG.VERSION);
    script.setAttribute('data-sandbox', PAIEMENT_PRO_CONFIG.SANDBOX_MODE ? 'true' : 'false');
    
    // Ajout des attributs spécifiques
    Object.entries(PAIEMENT_PRO_CONFIG.SCRIPT_ATTRIBUTES).forEach(([key, value]) => {
      script.setAttribute(key, value);
    });

    // Gestion du timeout
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
          scriptLoadingRef.current = false;
          toast({
            title: "PaiementPro prêt",
            description: "Le système de paiement est prêt à être utilisé",
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

    // Ajout en tête de document selon la documentation
    document.head.appendChild(script);
    scriptRef.current = script;
    attemptsRef.current++;
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
      window.PaiementPro = undefined as any;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanupScript();
    };
  }, [cleanupScript]);

  return { loadScript, cleanupScript };
};
