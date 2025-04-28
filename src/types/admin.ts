
export type AdPosition = "top" | "bottom" | "sidebar" | "inline" | "fixed";
export type AdSize = "banner" | "rectangle" | "leaderboard" | "skyscraper" | "mobile";
export type AdNetwork = "adsense" | "direct" | "local";

export interface AdPlacement {
  id: string;
  position: AdPosition;
  size: AdSize;
  network: AdNetwork;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  adCode?: string; // Champ pour le code HTML des annonces
}

export interface AdminActivity {
  id: string;
  adminId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, any> | null;
  createdAt: string;
}

export interface AdStats {
  id: string;
  placementId: string;
  impressions: number;
  clicks: number;
  date: string;
}
