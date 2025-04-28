
import { AdSize, AdPosition, AdNetwork } from "@/components/ads/AdTypes";

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
}

export interface AdminActivity {
  id: string;
  adminId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, any>;
  createdAt: string;
}

export interface AdStats {
  id: string;
  placementId: string;
  impressions: number;
  clicks: number;
  date: string;
}
