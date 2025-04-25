
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
    
    // Vérification de connectivité internet avant de charger le script
    if (!navigator.onLine) {
      console.error("Pas de connexion internet détectée");
      handleNetworkError("Aucune connexion internet détectée. Veuillez vérifier votre connexion et réessayer.");
      return;
    }
    
    // Vérification de disponibilité du service
    checkServiceAvailability().then(isAvailable => {
      if (!isAvailable) {
        console.error("Service PaiementPro indisponible");
        handleNetworkError("Le service de paiement semble indisponible actuellement. Veuillez réessayer plus tard.");
        return;
      }
      
      // Créer un nouveau script
      const script = document.createElement('script');
      const currentUrl = PAIEMENT_PRO_CONFIG.SCRIPT_URLS[urlIndexRef.current];
      
      if (PAIEMENT_PRO_CONFIG.DEBUG) {
        console.log(`Chargement du script depuis: ${currentUrl}`);
      }
      
      script.src = currentUrl;
      script.defer = true;
      script.async = true;
      script.crossOrigin = "anonymous"; // Ajouter CORS support
      
      // Définir un délai maximum pour le chargement du script
      const timeoutId = setTimeout(() => {
        if (scriptRef.current === script) {
          console.error(`Délai dépassé pour l'URL: ${currentUrl}`);
          handleScriptError(`Délai de chargement dépassé (${PAIEMENT_PRO_CONFIG.TIMEOUT / 1000}s)`);
        }
      }, PAIEMENT_PRO_CONFIG.TIMEOUT);
      
      script.onload = () => {
        console.log(`Script PaiementPro chargé avec succès depuis ${currentUrl}`);
        clearTimeout(timeoutId);
        
        setTimeout(() => {
          if (window.PaiementPro) {
            console.log("SDK PaiementPro détecté dans window");
            toast({
              title: "Paiement initialisé",
              description: "Le système de paiement est prêt à être utilisé",
            });
            onLoad();
          } else {
            console.error("Script chargé mais SDK non détecté");
            handleScriptError("Script chargé mais SDK non initialisé");
          }
        }, 500);
      };
      
      script.onerror = (e) => {
        clearTimeout(timeoutId);
        console.error(`Erreur lors du chargement depuis ${currentUrl}`, e);
        handleScriptError(`Échec de chargement depuis ${new URL(currentUrl).hostname}`);
      };
      
      document.body.appendChild(script);
      scriptRef.current = script;
    });
  };

  const checkServiceAvailability = async (): Promise<boolean> => {
    try {
      // Essai avec une requête HEAD pour vérifier si le service est disponible
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const url = PAIEMENT_PRO_CONFIG.SCRIPT_URLS[urlIndexRef.current];
      const response = await fetch(url, { 
        method: 'HEAD', 
        mode: 'no-cors',
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      return true; // Si on arrive ici, le service répond
    } catch (error) {
      console.warn("Échec de la vérification de disponibilité:", error);
      return navigator.onLine; // On se fie à la connectivité internet
    }
  };

  const handleNetworkError = (errorMessage: string) => {
    toast({
      title: "Problème réseau",
      description: errorMessage,
      variant: "destructive"
    });
    
    onError(errorMessage);
  };

  const handleScriptError = (details: string) => {
    // Essayer l'URL suivante si disponible
    if (urlIndexRef.current < PAIEMENT_PRO_CONFIG.SCRIPT_URLS.length - 1) {
      urlIndexRef.current += 1;
      console.log(`Tentative avec l'URL de secours: ${PAIEMENT_PRO_CONFIG.SCRIPT_URLS[urlIndexRef.current]}`);
      setTimeout(loadScript, PAIEMENT_PRO_CONFIG.RETRY_DELAY);
    } else if (attemptsRef.current < PAIEMENT_PRO_CONFIG.MAX_RETRIES) {
      // Réinitialiser l'index d'URL et réessayer
      urlIndexRef.current = 0;
      
      // Délai progressif entre les tentatives
      const retryDelay = PAIEMENT_PRO_CONFIG.RETRY_DELAY * Math.pow(1.5, attemptsRef.current - 1);
      console.log(`Nouvelle série de tentatives dans ${retryDelay/1000}s...`);
      
      setTimeout(loadScript, retryDelay);
    } else {
      // Échec définitif après toutes les tentatives
      console.error("Échec du chargement après toutes les tentatives");
      
      let errorMessage = "Impossible de charger le système de paiement. ";
      if (!navigator.onLine) {
        errorMessage += "Veuillez vérifier votre connexion internet et réessayer.";
      } else {
        errorMessage += "Le service peut être temporairement indisponible ou bloqué par votre réseau.";
      }
      
      onError(errorMessage);
      
      // Notification explicite
      toast({
        title: "Erreur de chargement",
        description: "Le système de paiement n'a pas pu être chargé après plusieurs tentatives",
        variant: "destructive",
      });
    }
  };

  const cleanupScript = () => {
    if (scriptRef.current) {
      scriptRef.current.remove();
      scriptRef.current = null;
    }
    
    // Nettoyer aussi les scripts qui pourraient rester dans le DOM
    const oldScripts = document.querySelectorAll('script[src*="paiementpro"]');
    oldScripts.forEach(script => script.remove());
    
    attemptsRef.current = 0;
    urlIndexRef.current = 0;
  };

  return { loadScript, cleanupScript };
};
