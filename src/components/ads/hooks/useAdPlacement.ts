
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdSize, AdPosition, AdNetwork } from '../AdTypes';
import { trackImpression } from '../tracking/AdTracker';

// Define the Supabase database response interface
interface AdPlacementRow {
  id: string;
  position: string;
  size: string;
  network: string;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  ad_code: string | null;
  image_url: string | null;
}

interface UseAdPlacementResult {
  isLoaded: boolean;
  isError: boolean;
  adHtml: string | null;
  adImageUrl: string | null;
  placementId: string | null;
}

/**
 * Custom hook to fetch and manage ad placement data
 */
export const useAdPlacement = (
  position: AdPosition, 
  size: AdSize, 
  network: AdNetwork,
  adsEnabled: boolean
): UseAdPlacementResult => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [adHtml, setAdHtml] = useState<string | null>(null);
  const [adImageUrl, setAdImageUrl] = useState<string | null>(null);
  const [placementId, setPlacementId] = useState<string | null>(null);
  
  useEffect(() => {
    if (!adsEnabled) {
      setIsError(true);
      return;
    }

    async function loadAd() {
      try {
        setIsLoaded(false);
        console.log(`Searching ad for position: ${position}, size: ${size}`);
        
        // Search for an active ad placement
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from('ad_placements')
          .select('*')
          .eq('position', position)
          .eq('size', size)
          .eq('is_active', true)
          .lte('start_date', now)
          .or(`end_date.is.null,end_date.gt.${now}`)
          .maybeSingle();

        if (error) {
          console.error('Error fetching ad placement:', error);
          throw error;
        }

        if (data) {
          const adData = data as AdPlacementRow;
          console.log('Ad placement found:', adData);
          
          setPlacementId(adData.id);
          
          // Track impression
          await trackImpression({ placementId: adData.id });
          
          setIsLoaded(true);
          
          // Handle different ad network types
          if (adData.network === 'adsense') {
            setAdHtml(adData.ad_code || null);
            setAdImageUrl(null);
          } else if (adData.network === 'direct') {
            setAdHtml(adData.ad_code || null);
            setAdImageUrl(null);
            console.log('Direct ad code:', adData.ad_code);
          } else if (adData.network === 'local') {
            setAdHtml(null);
            setAdImageUrl(adData.image_url || null);
          } else {
            setAdHtml(null);
            setAdImageUrl(null);
          }
        } else {
          console.log('No active ad placement found');
          setIsError(true);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la publicité:', error);
        setIsError(true);
      }
    }

    loadAd();
  }, [position, size, network, adsEnabled]);

  return {
    isLoaded,
    isError,
    adHtml,
    adImageUrl,
    placementId
  };
};
