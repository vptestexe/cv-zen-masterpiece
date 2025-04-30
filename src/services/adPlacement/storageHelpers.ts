
import { supabase } from "@/integrations/supabase/client";

/**
 * Ensures that the 'ads' bucket exists in Supabase storage
 * Now uses the check-storage-bucket edge function instead of direct creation
 */
export async function ensureAdsBucketExists() {
  try {
    // Call the edge function to check if the bucket exists
    const { data: response, error } = await supabase.functions.invoke(
      'check-storage-bucket',
      {
        body: { bucketName: 'ads' }
      }
    );
    
    if (error) {
      console.error("Error calling check-storage-bucket function:", error);
      // If there's an error, we'll continue with the app instead of blocking
      return;
    }
    
    if (response && response.success) {
      console.log("Ads bucket is available:", response.message);
    } else if (response) {
      console.warn("Ads bucket check failed:", response.message);
    }
  } catch (error) {
    console.error("Error ensuring ads bucket exists:", error);
    // We don't throw the error to avoid blocking the app entirely
  }
}
