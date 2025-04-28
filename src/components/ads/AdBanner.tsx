
import React, { useEffect, useRef, useState } from 'react';
import { AdProps } from './AdTypes';

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
  
  // Dimensions par défaut selon le format
  const dimensions = {
    'banner': { width: '468px', height: '60px' },
    'rectangle': { width: '300px', height: '250px' },
    'leaderboard': { width: '728px', height: '90px' },
    'skyscraper': { width: '160px', height: '600px' },
    'mobile': { width: '320px', height: '50px' }
  };

  // Simuler le chargement d'une publicité
  useEffect(() => {
    const timer = setTimeout(() => {
      // 90% chance de succès pour simuler un chargement réussi
      const success = Math.random() > 0.1;
      setIsLoaded(success);
      setIsError(!success);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const positionClasses = {
    'top': 'mt-0 mb-6',
    'bottom': 'mt-6 mb-0',
    'sidebar': 'my-4',
    'inline': 'my-4',
    'fixed': 'fixed bottom-4 right-4 z-50'
  };

  // Pour l'instant, on simule l'affichage publicitaire
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
        <div 
          className="ad-content flex items-center justify-center w-full h-full bg-gray-50 border border-gray-200"
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
      )}
    </div>
  );
};

export default AdBanner;
