
import { supabase } from "@/integrations/supabase/client";

/**
 * Ensures that the 'ads' bucket exists in Supabase storage
 * Now uses the check-storage-bucket edge function instead of direct creation
 */
export async function ensureAdsBucketExists() {
  try {
    // Définir un timeout pour ne pas bloquer l'application
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Bucket check timed out")), 5000)
    );
    
    // Appeler la fonction edge pour vérifier si le bucket existe
    const fetchPromise = supabase.functions.invoke(
      'check-storage-bucket',
      {
        body: { bucketName: 'ads' }
      }
    );
    
    // Utiliser Promise.race pour éviter de bloquer l'application
    const { data: response, error } = await Promise.race([
      fetchPromise,
      timeoutPromise as Promise<any>
    ]);
    
    if (error) {
      console.error("Error calling check-storage-bucket function:", error);
      // Si une erreur se produit, nous continuons avec l'application au lieu de la bloquer
      return;
    }
    
    if (response && response.success) {
      console.log("Ads bucket is available:", response.message);
    } else if (response) {
      console.warn("Ads bucket check failed:", response.message);
    }
  } catch (error) {
    console.error("Error ensuring ads bucket exists:", error);
    // Nous ne propageons pas l'erreur pour éviter de bloquer l'application entièrement
  }
}
