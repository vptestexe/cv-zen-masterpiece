
import { useRef, useEffect } from "react";

export const usePaiementProScript = (
  onLoad: () => void,
  onError: (error: string) => void
) => {
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const attemptsRef = useRef(0);

  const loadScript = () => {
    console.log("Chargement dynamique du script PaiementPro");
    
    // Incrémenter le nombre de tentatives
    attemptsRef.current += 1;
    console.log(`Tentative #${attemptsRef.current}`);
    
    // Nettoyer les anciens scripts
    const oldScript = document.querySelector('script[src*="paiementpro.min.js"]');
    if (oldScript) {
      console.log("Suppression de l'ancien script PaiementPro");
      oldScript.remove();
    }
    
    // Vérifier si window.PaiementPro existe déjà
    if (window.PaiementPro) {
      console.log("PaiementPro déjà disponible dans window, tentative d'utilisation directe");
      try {
        onLoad();
        return;
      } catch (err) {
        console.log("Échec d'utilisation du PaiementPro existant, rechargement complet");
        // On continue avec le chargement normal
      }
    }
    
    // Créer un nouveau script
    const script = document.createElement('script');
    
    // Utiliser une URL de secours au cas où l'URL principale ne fonctionne pas
    script.src = "https://js.paiementpro.net/v1/paiementpro.min.js";
    script.defer = true;
    script.async = true;
    
    // Définir un délai maximum pour le chargement du script
    const timeoutId = setTimeout(() => {
      if (scriptRef.current === script) {
        console.error("Délai dépassé pour le chargement du script PaiementPro");
        onError("Le délai de chargement du script PaiementPro a été dépassé");
      }
    }, 10000); // 10 secondes de délai maximum
    
    script.onload = () => {
      console.log("Script PaiementPro chargé avec succès");
      clearTimeout(timeoutId);
      
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
      clearTimeout(timeoutId);
      console.error("Erreur lors du chargement du script PaiementPro");
      onError(`Impossible de charger le script PaiementPro. Vérifiez votre connexion internet ou contactez le support.`);
    };
    
    document.body.appendChild(script);
    scriptRef.current = script;
  };

  const cleanupScript = () => {
    if (scriptRef.current) {
      scriptRef.current.remove();
      scriptRef.current = null;
    }
    attemptsRef.current = 0;
  };

  return { loadScript, cleanupScript };
};
