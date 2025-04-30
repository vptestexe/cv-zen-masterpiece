
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if the current user has admin privileges.
 * This function will make an RPC call to the Supabase is_admin function.
 * In development environments, it will fall back to assuming the user is an admin if the RPC call fails.
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_admin');
    
    if (error) {
      console.error("Error checking admin status:", error);
      
      // Development fallback
      if (import.meta.env.DEV) {
        console.log("Development environment detected, assuming admin role");
        return true;
      }
      
      return false;
    }
    
    return Boolean(data);
  } catch (error) {
    console.error("Error in admin status check:", error);
    
    // Development fallback
    if (import.meta.env.DEV) {
      return true;
    }
    
    return false;
  }
}
