
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
    console.error("Error fetching ad placements:", error.message);
    throw error;
  }

  return formatAdPlacements(data as AdPlacementRow[]);
}

export async function deleteAdPlacement(id: string) {
  try {
    // D'abord, récupérer les informations du placement pour obtenir l'URL de l'image si elle existe
    const { data: placement, error: fetchError } = await supabase
      .from('ad_placements')
      .select('network, image_url')
      .eq('id', id)
      .single();
      
    if (fetchError) {
      throw fetchError;
    }
    
    // Si c'est une publicité locale avec une image, supprimer l'image du stockage
    if (placement && placement.network === 'local' && placement.image_url) {
      try {
        // Extraire le chemin du fichier depuis l'URL
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
    
    // Supprimer l'entrée de la base de données
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

export async function saveAdPlacement(adData: Partial<AdPlacement>, imageFile: File | null = null) {
  try {
    let finalImageUrl = adData.imageUrl;
    
    // Si nous avons une nouvelle image locale, la télécharger d'abord
    if (imageFile && adData.network === "local") {
      // Vérifier si le bucket "ads" existe et le créer si nécessaire
      await ensureAdsBucketExists();
      
      // Générer un chemin de fichier unique
      const filePath = `${Date.now()}_${imageFile.name.replace(/\s+/g, '_')}`;
      
      // Télécharger l'image dans le stockage
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
      
      // Obtenir l'URL publique
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
      // Mettre à jour un emplacement publicitaire existant
      const { error } = await supabase
        .from('ad_placements')
        .update(formattedData)
        .eq('id', adData.id);
        
      if (error) throw error;
      
      return { success: true, message: "L'emplacement publicitaire a été mis à jour" };
    } else {
      // Créer un nouvel emplacement publicitaire
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

async function ensureAdsBucketExists() {
  try {
    // Vérifier si le bucket "ads" existe
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      throw error;
    }
    
    const adsBucket = buckets.find(bucket => bucket.name === 'ads');
    
    if (!adsBucket) {
      // Appeler notre fonction edge pour créer le bucket
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/setup-storage-bucket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
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
