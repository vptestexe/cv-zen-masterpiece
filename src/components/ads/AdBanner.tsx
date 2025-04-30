
import React from 'react';
import { AdProps } from './AdTypes';
import { useAds } from './AdProvider';
import { trackClick } from './tracking/AdTracker';
import { useAdPlacement } from './hooks/useAdPlacement';
import { AdContent } from './display/AdContent';
import { LoadingPlaceholder, ErrorPlaceholder } from './placeholders/AdPlaceholders';
import { getAdDimensions, getPositionClasses } from './utils/adDimensionUtil';

export const AdBanner = ({
  size = 'banner',
  position = 'top',
  network = 'adsense',
  id,
  className = '',
  showLabel = true
}: AdProps) => {
  const { adsEnabled } = useAds();
  const { isLoaded, isError, adHtml, adImageUrl, placementId } = useAdPlacement(
    position,
    size,
    network,
    adsEnabled
  );
  
  // If ads are disabled, don't render anything
  if (!adsEnabled) {
    return null;
  }

  const dimensions = getAdDimensions(size);
  const positionClass = getPositionClasses(position);
  
  const handleClick = async () => {
    try {
      await trackClick({ placementId });
    } catch (error) {
      console.error("Error tracking ad click:", error);
    }
  };

  return (
    <div 
      id={id || `ad-${position}-${size}`}
      className={`ad-container ${positionClass} ${className}`}
      style={{ 
        width: dimensions.width,
        height: dimensions.height,
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
        <LoadingPlaceholder />
      )}
      
      {isError && (
        <ErrorPlaceholder />
      )}
      
      {isLoaded && (
        <AdContent 
          adHtml={adHtml} 
          adImageUrl={adImageUrl} 
          handleClick={handleClick} 
        />
      )}
    </div>
  );
};

export default AdBanner;
