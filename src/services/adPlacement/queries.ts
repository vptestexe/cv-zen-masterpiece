
import { supabase } from "@/integrations/supabase/client";
import { AdPlacementRow } from "./types";
import { formatAdPlacements } from "./formatters";

/**
 * Fetches all ad placements from the database
 */
export async function fetchAdPlacements() {
  const { data, error } = await supabase
    .from('ad_placements')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching ad placements:", error.message);
    throw error;
  }

  return formatAdPlacements(data as AdPlacementRow[]);
}
