
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }
  
  try {
    // Parse request
    const { secret_name } = await req.json()
    
    if (!secret_name) {
      console.error("Nom du secret manquant dans la requête")
      return new Response(
        JSON.stringify({ error: "Le nom du secret est requis" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }
    
    console.log(`Récupération du secret: ${secret_name}`)
    
    // Get secret from Deno environment (Supabase secrets)
    const secretValue = Deno.env.get(secret_name)
    
    if (!secretValue) {
      console.error(`Secret "${secret_name}" n'est pas défini dans l'environnement`)
      return new Response(
        JSON.stringify({ error: `Configuration "${secret_name}" manquante` }),
        { 
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }
    
    console.log(`Secret "${secret_name}" récupéré avec succès`)
    
    // Return secret value
    return new Response(
      JSON.stringify({ value: secretValue }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  } catch (error) {
    console.error("Erreur lors de la récupération du secret:", error.message)
    
    return new Response(
      JSON.stringify({ error: "Erreur de serveur lors de la récupération de la configuration" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  }
})
