
import { AdSize, AdPosition } from '../AdTypes';

/**
 * Returns the dimensions for different ad sizes
 */
export const getAdDimensions = (size: AdSize) => {
  const dimensions = {
    'banner': { width: '468px', height: '60px' },
    'rectangle': { width: '300px', height: '250px' },
    'leaderboard': { width: '728px', height: '90px' },
    'skyscraper': { width: '160px', height: '600px' },
    'mobile': { width: '320px', height: '50px' }
  };
  
  return dimensions[size];
};

/**
 * Returns position-specific CSS classes
 */
export const getPositionClasses = (position: AdPosition) => {
  const positionClasses = {
    'top': 'mt-0 mb-6',
    'bottom': 'mt-6 mb-0',
    'sidebar': 'my-4',
    'inline': 'my-4',
    'fixed': 'fixed bottom-4 right-4 z-50'
  };
  
  return positionClasses[position];
};
