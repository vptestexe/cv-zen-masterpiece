
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if the current user has admin privileges.
 * This function will make an RPC call to the Supabase is_admin function.
 * In development environments, it will fall back to assuming the user is an admin if the RPC call fails.
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    // Check if we already have the user's admin status cached in session storage
    const cachedStatus = sessionStorage.getItem('isAdmin');
    if (cachedStatus !== null) {
      return cachedStatus === 'true';
    }
    
    // Make the RPC call to check admin status
    const { data, error } = await supabase.rpc('is_admin');
    
    if (error) {
      console.error("Error checking admin status:", error);
      
      // Development fallback
      if (import.meta.env.DEV) {
        console.log("Development environment detected, assuming admin role");
        sessionStorage.setItem('isAdmin', 'true');
        return true;
      }
      
      sessionStorage.setItem('isAdmin', 'false');
      return false;
    }
    
    // Cache the result in session storage to reduce API calls
    sessionStorage.setItem('isAdmin', Boolean(data).toString());
    return Boolean(data);
  } catch (error) {
    console.error("Error in admin status check:", error);
    
    // Development fallback
    if (import.meta.env.DEV) {
      sessionStorage.setItem('isAdmin', 'true');
      return true;
    }
    
    sessionStorage.setItem('isAdmin', 'false');
    return false;
  }
}
