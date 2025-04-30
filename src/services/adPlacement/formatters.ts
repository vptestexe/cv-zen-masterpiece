
import { AdPlacement, AdPosition, AdSize, AdNetwork } from "@/types/admin";
import { AdPlacementRow } from "./types";

/**
 * Formats database rows into AdPlacement objects
 */
export function formatAdPlacements(data: AdPlacementRow[]): AdPlacement[] {
  return data.map(item => ({
    id: item.id,
    position: item.position as AdPosition,
    size: item.size as AdSize,
    network: item.network as AdNetwork,
    isActive: item.is_active,
    startDate: item.start_date,
    endDate: item.end_date || undefined,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    adCode: item.ad_code || undefined,
    imageUrl: item.image_url || undefined
  }));
}
