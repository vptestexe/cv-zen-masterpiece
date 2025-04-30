
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    });

    // Get bucket name from request body or use 'ads' as default
    const { bucketName = 'ads' } = await req.json().catch(() => ({}));
    
    // Try to list files in the bucket to check if it's available
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .list();
    
    if (error) {
      console.error(`Error checking bucket ${bucketName}:`, error.message);
      throw error;
    }
    
    // Return success response with bucket content list
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
