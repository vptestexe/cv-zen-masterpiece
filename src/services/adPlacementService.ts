
import { supabase } from "@/integrations/supabase/client";
import { AdPlacement, AdPosition, AdSize, AdNetwork } from "@/types/admin";
import { useToast } from "@/components/ui/use-toast";

// Define the Supabase database response interface
export interface AdPlacementRow {
  id: string;
  position: string;
  size: string;
  network: string;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  ad_code: string | null;
  image_url: string | null;
}

export async function fetchAdPlacements() {
  const { data, error } = await supabase
    .from('ad_placements')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return formatAdPlacements(data as AdPlacementRow[]);
}

export async function deleteAdPlacement(id: string) {
  const { error } = await supabase
    .from('ad_placements')
    .delete()
    .eq('id', id);
    
  if (error) {
    throw error;
  }
}

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
