
import React from 'react';

interface PlaceholderProps {
  message?: string;
  className?: string;
}

export const LoadingPlaceholder: React.FC<PlaceholderProps> = ({ 
  message = "Chargement de la publicité...",
  className = ""
}) => {
  return (
    <div className={`ad-loading flex items-center justify-center w-full h-full bg-gray-100 border border-gray-200 ${className}`}>
      <span className="text-xs text-gray-500">{message}</span>
    </div>
  );
};

export const ErrorPlaceholder: React.FC<PlaceholderProps> = ({ 
  message = "Publicité non disponible",
  className = ""
}) => {
  return (
    <div className={`ad-error flex items-center justify-center w-full h-full bg-gray-50 border border-gray-200 ${className}`}>
      <span className="text-xs text-gray-500">{message}</span>
    </div>
  );
};

export const DefaultAdPlaceholder: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return (
    <div 
      className="ad-content flex items-center justify-center w-full h-full bg-gray-50 border border-gray-200 cursor-pointer"
      onClick={onClick}
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
  );
};
