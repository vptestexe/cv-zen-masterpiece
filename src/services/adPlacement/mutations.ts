
import { supabase } from "@/integrations/supabase/client";
import { AdPlacement } from "@/types/admin";
import { SaveAdPlacementResult } from "./types";
import { ensureAdsBucketExists } from "./storageHelpers";

/**
 * Deletes an ad placement and its associated resources
 */
export async function deleteAdPlacement(id: string) {
  try {
    // First, retrieve the placement info to get the image URL if it exists
    const { data: placement, error: fetchError } = await supabase
      .from('ad_placements')
      .select('network, image_url')
      .eq('id', id)
      .single();
      
    if (fetchError) {
      console.error("Error fetching ad placement:", fetchError.message);
      throw fetchError;
    }
    
    // If it's a local ad with an image, delete the image from storage
    if (placement && placement.network === 'local' && placement.image_url) {
      try {
        // Extract the file path from the URL
        const url = new URL(placement.image_url);
        const pathParts = url.pathname.split('/');
        const bucketName = 'ads';
        const filePath = pathParts[pathParts.length - 1];
        
        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from(bucketName)
            .remove([filePath]);
            
          if (storageError) {
            console.warn("Error removing image file:", storageError.message);
          }
        }
      } catch (e) {
        console.warn("Error parsing image URL:", e);
      }
    }
    
    // Delete the database entry
    const { error } = await supabase
      .from('ad_placements')
      .delete()
      .eq('id', id);
      
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error deleting ad placement:", error);
    throw error;
  }
}

/**
 * Saves (creates or updates) an ad placement
 */
export async function saveAdPlacement(adData: Partial<AdPlacement>, imageFile: File | null = null): Promise<SaveAdPlacementResult> {
  try {
    let finalImageUrl = adData.imageUrl;
    
    // If we have a new local image, upload it first
    if (imageFile && adData.network === "local") {
      // Make sure the "ads" bucket exists
      await ensureAdsBucketExists();
      
      // Generate a unique file path
      const filePath = `${Date.now()}_${imageFile.name.replace(/\s+/g, '_')}`;
      
      // Upload the image to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ads')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        console.error("Error uploading image:", uploadError.message);
        throw uploadError;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('ads')
        .getPublicUrl(filePath);
      
      finalImageUrl = publicUrl;
    }
    
    const formattedData = {
      position: adData.position,
      size: adData.size,
      network: adData.network,
      is_active: adData.isActive ?? true,
      start_date: adData.startDate ? new Date(adData.startDate).toISOString() : new Date().toISOString(),
      end_date: adData.endDate ? new Date(adData.endDate).toISOString() : null,
      ad_code: adData.network === "local" ? null : adData.adCode,
      image_url: adData.network === "local" ? finalImageUrl : null,
      updated_at: new Date().toISOString()
    };
    
    if (adData.id) {
      // Update an existing ad placement
      const { error } = await supabase
        .from('ad_placements')
        .update(formattedData)
        .eq('id', adData.id);
        
      if (error) throw error;
      
      return { success: true, message: "L'emplacement publicitaire a été mis à jour" };
    } else {
      // Create a new ad placement
      const { error } = await supabase
        .from('ad_placements')
        .insert({
          ...formattedData,
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      return { success: true, message: "L'emplacement publicitaire a été créé" };
    }
  } catch (error) {
    console.error("Error saving ad placement:", error);
    return { success: false, message: "Impossible de sauvegarder l'emplacement publicitaire", error };
  }
}
