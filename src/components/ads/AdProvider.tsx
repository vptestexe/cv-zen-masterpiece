
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
    
    // Simuler le chargement des scripts publicitaires
    const timer = setTimeout(() => {
      setAdsLoaded(true);
      // Simple détection de bloqueur (sera amélioré plus tard)
      setAdBlockerDetected(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

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
