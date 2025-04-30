
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
      // Create the ads bucket using Supabase storage API
      const { data, error: createError } = await supabase.storage.createBucket('ads', {
        public: true,
        fileSizeLimit: 10485760, // 10MB limit for ad images
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
      });
      
      if (createError) {
        console.error("Error creating ads bucket:", createError);
        throw createError;
      }
      
      console.log("Ads bucket created successfully");
    }
  } catch (error) {
    console.error("Error ensuring ads bucket exists:", error);
    throw error;
  }
}
