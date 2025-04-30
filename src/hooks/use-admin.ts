
import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { toast } from '@/components/ui/use-toast';
import { checkIsAdmin } from '@/services/adPlacement';

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
        // Use the dedicated function to check admin status
        const adminStatus = await checkIsAdmin();
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error("Error in admin status check:", error);
        
        // Only show toast in production
        if (!import.meta.env.DEV) {
          toast({
            title: "Erreur",
            description: "Impossible de vérifier les permissions d'administrateur",
            variant: "destructive",
          });
        }
        
        // In development, assume admin role
        if (import.meta.env.DEV) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } finally {
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
