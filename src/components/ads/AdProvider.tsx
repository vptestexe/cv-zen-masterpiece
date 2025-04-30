
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
  adsLoaded: false,
  adBlockerDetected: false
});

export const useAds = () => useContext(AdContext);

interface AdProviderProps {
  children: ReactNode;
}

export const AdProvider = ({ children }: AdProviderProps) => {
  const [adsEnabled, setAdsEnabled] = useState(true);
  const [adsLoaded, setAdsLoaded] = useState(false);
  const [adBlockerDetected, setAdBlockerDetected] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();

  // Fonction pour activer/désactiver les publicités
  const toggleAds = () => {
    const newValue = !adsEnabled;
    setAdsEnabled(newValue);
    localStorage.setItem('ads_enabled', newValue ? 'true' : 'false');
  };

  // Récupérer la préférence utilisateur au chargement
  useEffect(() => {
    const savedPreference = localStorage.getItem('ads_enabled');
    if (savedPreference !== null) {
      setAdsEnabled(savedPreference === 'true');
    }
    
    // Initialisation du système de publicités
    const initAds = async () => {
      try {
        // Make sure the storage bucket exists
        await ensureAdsBucketExists();
        setAdsLoaded(true);
      } catch (error) {
        console.error("Error initializing ads system:", error);
        setAdsLoaded(true);
      }
    };
    
    // Exécuter l'initialisation seulement une fois
    if (!initialized) {
      initAds();
      setInitialized(true);
    }
  }, [initialized]);

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
};
