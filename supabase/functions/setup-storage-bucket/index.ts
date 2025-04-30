
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Create the 'ads' bucket if it doesn't exist
    const { data: existingBuckets, error: bucketsError } = await supabaseAdmin
      .storage
      .listBuckets();
    
    if (bucketsError) {
      throw bucketsError;
    }
    
    const adsBucketExists = existingBuckets.some(bucket => bucket.name === 'ads');
    
    if (!adsBucketExists) {
      const { error: createError } = await supabaseAdmin.storage.createBucket('ads', {
        public: true,
        fileSizeLimit: 10485760, // 10MB limit for ad images
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
      });
      
      if (createError) {
        throw createError;
      }
      
      // Set up RLS policy to allow public read access
      const { error: policyError } = await supabaseAdmin.rpc('create_storage_policy', {
        bucket_name: 'ads',
        policy_name: 'Public Read Access',
        definition: 'true',
        operation: 'SELECT'
      });
      
      if (policyError) {
        console.error("Error setting up policy:", policyError);
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "Storage bucket setup successful" }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error setting up storage:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
