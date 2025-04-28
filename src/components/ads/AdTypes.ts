
export type AdSize = 'banner' | 'rectangle' | 'leaderboard' | 'skyscraper' | 'mobile';
export type AdPosition = 'top' | 'bottom' | 'sidebar' | 'inline' | 'fixed';
export type AdNetwork = 'adsense' | 'local' | 'direct';

export interface AdProps {
  size: AdSize;
  position: AdPosition;
  network?: AdNetwork;
  id?: string;
  className?: string;
  showLabel?: boolean;
}
