
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Gérer les requêtes CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Créer un client Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase credentials");
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    });

    // Obtenir le nom du bucket à partir du corps de la requête ou utiliser 'ads' par défaut
    let bucketName = 'ads';
    try {
      const body = await req.json().catch(() => ({}));
      bucketName = body.bucketName || 'ads';
    } catch (error) {
      console.error("Error parsing request body:", error.message);
      // Continuer avec le nom de bucket par défaut
    }
    
    // Essayer de lister les fichiers dans le bucket pour vérifier s'il est disponible
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .list();
    
    if (error) {
      console.error(`Error checking bucket ${bucketName}:`, error.message);
      throw error;
    }
    
    // Retourner une réponse de succès avec la liste du contenu du bucket
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Bucket ${bucketName} is available`,
        data: data
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error checking storage bucket:", error.message);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: `Storage bucket is not available: ${error.message}` 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
