
import { supabase } from '@/integrations/supabase/client';

interface TrackingProps {
  placementId: string | null;
}

/**
 * Handles ad impression tracking
 */
export const trackImpression = async ({ placementId }: TrackingProps): Promise<void> => {
  if (!placementId) return;
  
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if an entry exists already for today
    const { data: existingStat, error: checkError } = await supabase
      .from('ad_stats')
      .select('id, impressions')
      .eq('placement_id', placementId)
      .eq('date', today)
      .maybeSingle();
      
    if (checkError) throw checkError;
    
    if (existingStat) {
      // Update existing entry
      await supabase
        .from('ad_stats')
        .update({ 
          impressions: existingStat.impressions + 1 
        })
        .eq('id', existingStat.id);
    } else {
      // Create a new entry
      await supabase
        .from('ad_stats')
        .insert({
          placement_id: placementId,
          impressions: 1,
          clicks: 0,
          date: today
        });
    }
  } catch (error) {
    console.error('Error recording ad impression:', error);
  }
};

/**
 * Handles ad click tracking
 */
export const trackClick = async ({ placementId }: TrackingProps): Promise<void> => {
  if (!placementId) return;
  
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if an entry exists already for today
    const { data: existingStat, error: checkError } = await supabase
      .from('ad_stats')
      .select('id, clicks')
      .eq('placement_id', placementId)
      .eq('date', today)
      .maybeSingle();
      
    if (checkError) throw checkError;
    
    if (existingStat) {
      // Update existing entry
      await supabase
        .from('ad_stats')
        .update({ 
          clicks: existingStat.clicks + 1 
        })
        .eq('id', existingStat.id);
    } else {
      // Create a new entry
      await supabase
        .from('ad_stats')
        .insert({
          placement_id: placementId,
          impressions: 0,
          clicks: 1,
          date: today
        });
    }
  } catch (error) {
    console.error('Error recording ad click:', error);
  }
};
