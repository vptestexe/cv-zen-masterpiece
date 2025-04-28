
import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { toast } from '@/components/ui/use-toast';

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
        // For development, we're simulating an admin check instead of using the actual function
        // When the Supabase types are updated, replace with actual RPC call
        setTimeout(() => {
          // For demo purposes, all authenticated users are admins
          setIsAdmin(true);
          setLoading(false);
        }, 500);
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
