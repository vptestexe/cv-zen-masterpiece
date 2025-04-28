
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { AdPlacement, AdPosition, AdSize, AdNetwork } from "@/types/admin";
import AdPlacementForm from "./AdPlacementForm";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdPlacementList() {
  const [placements, setPlacements] = useState<AdPlacement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPlacement, setSelectedPlacement] = useState<AdPlacement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPlacements();
  }, []);

  async function loadPlacements() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ad_placements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const formattedPlacements = data.map(item => ({
        id: item.id,
        position: item.position as AdPosition,
        size: item.size as AdSize,
        network: item.network as AdNetwork,
        isActive: item.is_active,
        startDate: item.start_date,
        endDate: item.end_date || undefined,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      setPlacements(formattedPlacements);
    } catch (error) {
      console.error("Error loading ad placements:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les emplacements publicitaires",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet emplacement publicitaire ?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('ad_placements')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Succès",
        description: "L'emplacement publicitaire a été supprimé",
      });
      
      loadPlacements();
    } catch (error) {
      console.error("Error deleting ad placement:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'emplacement publicitaire",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Emplacements publicitaires</h2>
        <Button onClick={() => {
          setSelectedPlacement(null);
          setShowForm(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {placements.length === 0 ? (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-muted-foreground">Aucun emplacement publicitaire n'a été créé.</p>
          <p className="mt-2">Cliquez sur "Ajouter" pour créer votre premier emplacement.</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead>Taille</TableHead>
                <TableHead>Réseau</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date de début</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placements.map((placement) => (
                <TableRow key={placement.id}>
                  <TableCell className="font-medium">{placement.position}</TableCell>
                  <TableCell>{placement.size}</TableCell>
                  <TableCell>{placement.network}</TableCell>
                  <TableCell>
                    {placement.isActive ? 
                      <span className="text-green-600 font-medium">Actif</span> : 
                      <span className="text-red-600 font-medium">Inactif</span>
                    }
                  </TableCell>
                  <TableCell>
                    {format(new Date(placement.startDate), 'dd/MM/yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPlacement(placement);
                          setShowForm(true);
                        }}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(placement.id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {showForm && (
        <AdPlacementForm
          placement={selectedPlacement}
          onClose={() => {
            setShowForm(false);
            setSelectedPlacement(null);
          }}
          onSave={() => {
            loadPlacements();
            setShowForm(false);
            setSelectedPlacement(null);
          }}
        />
      )}
    </div>
  );
}
