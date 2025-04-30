
import React from 'react';
import { DefaultAdPlaceholder } from '../placeholders/AdPlaceholders';

interface AdContentProps {
  adHtml: string | null;
  adImageUrl: string | null;
  handleClick: () => void;
}

/**
 * Renders the actual ad content based on the type (HTML or image)
 */
export const AdContent: React.FC<AdContentProps> = ({ adHtml, adImageUrl, handleClick }) => {
  if (adHtml) {
    return (
      <div 
        className="ad-content w-full h-full"
        dangerouslySetInnerHTML={{ __html: adHtml }}
        onClick={handleClick}
      />
    );
  } 
  
  if (adImageUrl) {
    return (
      <div 
        className="ad-content flex items-center justify-center w-full h-full cursor-pointer"
        onClick={handleClick}
      >
        <img 
          src={adImageUrl} 
          alt="Publicité" 
          className="max-w-full max-h-full object-contain"
        />
      </div>
    );
  }
  
  // Default placeholder ad
  return <DefaultAdPlaceholder onClick={handleClick} />;
};
