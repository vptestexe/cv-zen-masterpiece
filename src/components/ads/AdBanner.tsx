
import React, { useEffect, useRef, useState } from 'react';
import { AdProps } from './AdTypes';
import { supabase } from '@/integrations/supabase/client';
import { useAds } from './AdProvider';

export const AdBanner = ({
  size = 'banner',
  position = 'top',
  network = 'adsense',
  id,
  className = '',
  showLabel = true
}: AdProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [adHtml, setAdHtml] = useState<string | null>(null);
  const { adsEnabled } = useAds();
  
  // Dimensions par défaut selon le format
  const dimensions = {
    'banner': { width: '468px', height: '60px' },
    'rectangle': { width: '300px', height: '250px' },
    'leaderboard': { width: '728px', height: '90px' },
    'skyscraper': { width: '160px', height: '600px' },
    'mobile': { width: '320px', height: '50px' }
  };

  // Chercher les publicités actives pour cette position et taille
  useEffect(() => {
    if (!adsEnabled) {
      setIsError(true);
      return;
    }

    async function loadAd() {
      try {
        setIsLoaded(false);
        console.log(`Searching ad for position: ${position}, size: ${size}`);
        
        // Rechercher un emplacement publicitaire actif correspondant
        const { data, error } = await supabase
          .from('ad_placements')
          .select('*')
          .eq('position', position)
          .eq('size', size)
          .eq('is_active', true)
          .maybeSingle();

        if (error) {
          console.error('Error fetching ad placement:', error);
          throw error;
        }

        if (data) {
          console.log('Ad placement found:', data);
          
          // Enregistrer une impression
          try {
            await supabase
              .from('ad_stats')
              .insert({
                placement_id: data.id,
                impressions: 1,
                clicks: 0,
                date: new Date().toISOString().split('T')[0]
              });
          } catch (statError) {
            console.error('Erreur lors de l\'enregistrement de l\'impression:', statError);
          }
          
          setIsLoaded(true);
          
          // Gérer les différents types de réseaux publicitaires
          if (data.network === 'adsense') {
            setAdHtml(data.ad_code || null);
          } else if (data.network === 'direct') {
            // Pour les annonces directes, utiliser le code HTML fourni
            setAdHtml(data.ad_code || null);
            console.log('Direct ad code:', data.ad_code);
          } else {
            // Publicités locales (par défaut)
            setAdHtml(null);
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
  
  const handleAdClick = async () => {
    try {
      // Rechercher un emplacement publicitaire actif correspondant
      const { data, error } = await supabase
        .from('ad_placements')
        .select('id')
        .eq('position', position)
        .eq('size', size)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        // Enregistrer un clic
        await supabase
          .from('ad_stats')
          .insert({
            placement_id: data.id,
            impressions: 0,
            clicks: 1,
            date: new Date().toISOString().split('T')[0]
          });
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du clic:', error);
    }
  };

  const positionClasses = {
    'top': 'mt-0 mb-6',
    'bottom': 'mt-6 mb-0',
    'sidebar': 'my-4',
    'inline': 'my-4',
    'fixed': 'fixed bottom-4 right-4 z-50'
  };

  if (!adsEnabled) {
    return null;
  }

  return (
    <div 
      id={id || `ad-${position}-${size}`}
      ref={adRef}
      className={`ad-container ${positionClasses[position]} ${className}`}
      style={{ 
        width: dimensions[size].width,
        height: dimensions[size].height,
        maxWidth: '100%',
        overflow: 'hidden',
        margin: '0 auto',
        position: position === 'fixed' ? 'fixed' : 'relative'
      }}
    >
      {showLabel && (
        <div className="ad-label text-xs text-gray-500 text-center mb-1">
          Publicité
        </div>
      )}
      
      {!isLoaded && !isError && (
        <div className="ad-loading flex items-center justify-center w-full h-full bg-gray-100 border border-gray-200">
          <span className="text-xs text-gray-500">Chargement de la publicité...</span>
        </div>
      )}
      
      {isError && (
        <div className="ad-error flex items-center justify-center w-full h-full bg-gray-50 border border-gray-200">
          <span className="text-xs text-gray-500">Publicité non disponible</span>
        </div>
      )}
      
      {isLoaded && (
        adHtml ? (
          <div 
            className="ad-content w-full h-full"
            dangerouslySetInnerHTML={{ __html: adHtml }}
            onClick={handleAdClick}
          />
        ) : (
          <div 
            className="ad-content flex items-center justify-center w-full h-full bg-gray-50 border border-gray-200 cursor-pointer"
            onClick={handleAdClick}
            style={{
              backgroundImage: 'linear-gradient(45deg, #f3f4f6 25%, transparent 25%, transparent 75%, #f3f4f6 75%, #f3f4f6), linear-gradient(45deg, #f3f4f6 25%, transparent 25%, transparent 75%, #f3f4f6 75%, #f3f4f6)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 10px 10px'
            }}
          >
            <div className="text-center">
              <span className="font-bold text-sm">Votre publicité ici</span>
              <p className="text-xs text-gray-600">Contactez-nous pour plus d'informations</p>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default AdBanner;
