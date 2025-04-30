
import { AdPlacement, AdPosition, AdSize, AdNetwork } from "@/types/admin";

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

export interface SaveAdPlacementResult {
  success: boolean;
  message: string;
  error?: unknown;
}
