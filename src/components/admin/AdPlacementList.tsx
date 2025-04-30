
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { AdPlacement } from "@/types/admin";
import AdPlacementForm from "./adPlacement/AdPlacementForm";
import { LoadingSpinner } from "./adPlacement/LoadingSpinner";
import { EmptyState } from "./adPlacement/EmptyState";
import { AdPlacementTable } from "./adPlacement/AdPlacementTable";
import { fetchAdPlacements, deleteAdPlacement } from "@/services/adPlacementService";

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
      const formattedPlacements = await fetchAdPlacements();
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
      await deleteAdPlacement(id);
      
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

  const handleAddNew = () => {
    setSelectedPlacement(null);
    setShowForm(true);
  };

  const handleEdit = (placement: AdPlacement) => {
    setSelectedPlacement(placement);
    setShowForm(true);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Emplacements publicitaires</h2>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {placements.length === 0 ? (
        <EmptyState onAddNew={handleAddNew} />
      ) : (
        <AdPlacementTable 
          placements={placements} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
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
