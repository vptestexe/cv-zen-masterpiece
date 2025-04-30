
import { supabase } from "@/integrations/supabase/client";

/**
 * Ensures that the 'ads' bucket exists in Supabase storage
 */
export async function ensureAdsBucketExists() {
  try {
    // Check if the bucket "ads" exists
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      throw error;
    }
    
    const adsBucket = buckets.find(bucket => bucket.name === 'ads');
    
    if (!adsBucket) {
      // Call our function edge for creating the bucket
      const response = await fetch('/functions/v1/setup-storage-bucket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer anon-key`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create ads bucket: ${errorData.error || response.statusText}`);
      }
    }
  } catch (error) {
    console.error("Error ensuring ads bucket exists:", error);
    throw error;
  }
}
