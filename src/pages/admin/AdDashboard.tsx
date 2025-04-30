
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdPlacementList from "@/components/admin/AdPlacementList";
import AdStatsView from "@/components/admin/AdStatsView";
import ActivityLogs from "@/components/admin/ActivityLogs";

export default function AdDashboard() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdmin();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (!isAdmin) {
    // Redirect non-admin users to the dashboard
    navigate("/dashboard");
    return null;
  }

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
