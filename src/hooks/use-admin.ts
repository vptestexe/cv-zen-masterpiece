
import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user?.id) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // First try to check using the database function
        const { data, error } = await supabase.rpc('is_admin');
        
        if (error) {
          console.error("Error checking admin status:", error);
          
          // Fallback for development - assume auth users are admins
          // This is a development fallback only and should be removed in production
          if (import.meta.env.DEV) {
            console.log("Development environment detected, assuming admin role");
            setIsAdmin(true);
          } else {
            toast({
              title: "Erreur",
              description: "Impossible de vérifier les permissions d'administrateur",
              variant: "destructive",
            });
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(Boolean(data));
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error in admin status check:", error);
        toast({
          title: "Erreur",
          description: "Impossible de vérifier les permissions d'administrateur",
          variant: "destructive",
        });
        setIsAdmin(false);
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, [user]);

  return {
    isAdmin,
    loading
  };
}
