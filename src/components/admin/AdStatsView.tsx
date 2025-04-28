
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { AdStats } from "@/types/admin";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function AdStatsView() {
  const [stats, setStats] = useState<AdStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<string>("7");
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  async function loadStats() {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_ad_stats', { 
        days: parseInt(timeRange, 10) 
      });

      if (error) {
        throw error;
      }

      const formattedStats = data.map(stat => ({
        id: stat.id,
        placementId: stat.placement_id,
        impressions: stat.impressions,
        clicks: stat.clicks,
        date: stat.date
      }));

      setStats(formattedStats);
      setLoading(false);
    } catch (error) {
      console.error("Error loading ad stats:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques publicitaires",
        variant: "destructive",
      });
      setLoading(false);
    }
  }

  // Transformer les données pour le graphique
  const chartData = stats.map(stat => ({
    date: new Date(stat.date).toLocaleDateString('fr-FR'),
    impressions: stat.impressions,
    clicks: stat.clicks,
    ctr: stat.impressions > 0 ? ((stat.clicks / stat.impressions) * 100).toFixed(2) : 0
  }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Statistiques des publicités</h2>
        <div className="flex items-center space-x-2">
          <Label htmlFor="timeRange">Période :</Label>
          <Select
            value={timeRange}
            onValueChange={value => setTimeRange(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sélectionner la période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 derniers jours</SelectItem>
              <SelectItem value="30">30 derniers jours</SelectItem>
              <SelectItem value="90">90 derniers jours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Impressions</CardTitle>
                <CardDescription>Total sur la période</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {chartData.reduce((sum, item) => sum + Number(item.impressions), 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Clics</CardTitle>
                <CardDescription>Total sur la période</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {chartData.reduce((sum, item) => sum + Number(item.clicks), 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>CTR moyen</CardTitle>
                <CardDescription>Taux de clics moyen</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {chartData.length > 0
                    ? (chartData.reduce((sum, item) => sum + Number(item.ctr), 0) / chartData.length).toFixed(2)
                    : "0"}%
                </p>
              </CardContent>
            </Card>
          </div>

          {chartData.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Évolution des performances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="impressions" name="Impressions" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="clicks" name="Clics" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="py-10">
              <CardContent className="flex flex-col items-center justify-center text-center">
                <p className="text-lg text-muted-foreground">Aucune donnée disponible pour cette période</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
