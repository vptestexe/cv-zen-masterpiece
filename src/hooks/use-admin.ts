
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
        const { data, error } = await supabase.rpc('is_admin');
        
        if (error) {
          throw error;
        }
        
        setIsAdmin(Boolean(data));
        setLoading(false);
      } catch (error) {
        console.error("Error checking admin status:", error);
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
