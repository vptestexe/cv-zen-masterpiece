
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { ensureAdsBucketExists } from '@/services/adPlacement/storageHelpers';

interface AdContextType {
  adsEnabled: boolean;
  toggleAds: () => void;
  adsLoaded: boolean;
  adBlockerDetected: boolean;
}

const AdContext = createContext<AdContextType>({
  adsEnabled: true,
  toggleAds: () => {},
  adsLoaded: true, // Always default to true to avoid blocking the app
  adBlockerDetected: false
});

export const useAds = () => useContext(AdContext);

interface AdProviderProps {
  children: ReactNode;
}

export const AdProvider = ({ children }: AdProviderProps) => {
  const [adsEnabled, setAdsEnabled] = useState(true);
  const [adsLoaded, setAdsLoaded] = useState(true); // Always default to true
  const [adBlockerDetected, setAdBlockerDetected] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();

  // Fonction pour activer/désactiver les publicités
  const toggleAds = () => {
    try {
      const newValue = !adsEnabled;
      setAdsEnabled(newValue);
      localStorage.setItem('ads_enabled', newValue ? 'true' : 'false');
    } catch (error) {
      console.error("Error toggling ads:", error);
      // Ne pas bloquer l'application en cas d'erreur
    }
  };

  // Récupérer la préférence utilisateur au chargement
  useEffect(() => {
    try {
      const savedPreference = localStorage.getItem('ads_enabled');
      if (savedPreference !== null) {
        setAdsEnabled(savedPreference === 'true');
      }
      
      // Initialisation du système de publicités
      const initAds = async () => {
        try {
          // Vérifier si le bucket de stockage existe mais ne pas bloquer l'application s'il n'existe pas
          await ensureAdsBucketExists();
        } catch (error) {
          console.error("Error initializing ads system:", error);
          // Ne pas bloquer l'application en cas d'erreur
        } finally {
          // S'assurer que l'application est marquée comme chargée indépendamment de l'état du bucket
          setAdsLoaded(true);
        }
      };
      
      // Exécuter l'initialisation seulement une fois
      if (!initialized) {
        initAds().catch(error => {
          console.error("Failed to initialize ads:", error);
          // S'assurer que l'application continue même en cas d'erreur
          setAdsLoaded(true);
        });
        setInitialized(true);
      }
    } catch (error) {
      console.error("Error in AdProvider:", error);
      // S'assurer que l'application continue même en cas d'erreur
      setAdsLoaded(true);
      setInitialized(true);
    }
  }, [initialized]);

  // Utiliser un rendu avec gestion d'erreur
  try {
    return (
      <AdContext.Provider value={{ 
        adsEnabled, 
        toggleAds, 
        adsLoaded, 
        adBlockerDetected 
      }}>
        {children}
      </AdContext.Provider>
    );
  } catch (error) {
    console.error("Error rendering AdProvider:", error);
    // En cas d'erreur, retourner les enfants sans contexte plutôt que de planter
    return <>{children}</>;
  }
};
