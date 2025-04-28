
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import AdPlacementList from "@/components/admin/AdPlacementList";
import AdStatsView from "@/components/admin/AdStatsView";
import ActivityLogs from "@/components/admin/ActivityLogs";
import { AdPlacement } from "@/types/admin";

export default function AdDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user?.id) {
        navigate("/login");
        return;
      }

      try {
        const { data, error } = await supabase.rpc('is_admin', { user_uid: user.id });
        
        if (error) throw error;
        
        if (!data) {
          toast({
            title: "Accès refusé",
            description: "Vous n'avez pas les permissions nécessaires pour accéder à cette page.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error("Error checking admin status:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, [user, navigate]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Administration des publicités</h1>
      
      <Tabs defaultValue="placements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="placements">Emplacements</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
          <TabsTrigger value="logs">Journal d'activité</TabsTrigger>
        </TabsList>

        <TabsContent value="placements">
          <AdPlacementList />
        </TabsContent>

        <TabsContent value="stats">
          <AdStatsView />
        </TabsContent>

        <TabsContent value="logs">
          <ActivityLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
}
