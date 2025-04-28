
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { AdPlacement } from "@/types/admin";
import AdPlacementForm from "./AdPlacementForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data for development
const MOCK_PLACEMENTS: AdPlacement[] = [
  {
    id: "1",
    position: "top",
    size: "banner",
    network: "adsense",
    isActive: true,
    startDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    position: "sidebar",
    size: "rectangle",
    network: "direct",
    isActive: false,
    startDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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
      // Using mock data instead of direct Supabase query
      // When the Supabase types are updated, replace with actual query
      setTimeout(() => {
        setPlacements(MOCK_PLACEMENTS);
        setLoading(false);
      }, 500); // Simulate loading
    } catch (error) {
      console.error("Error loading ad placements:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les emplacements publicitaires",
        variant: "destructive",
      });
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="animate-pulse">Chargement...</div>;
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Position</TableHead>
            <TableHead>Taille</TableHead>
            <TableHead>Réseau</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {placements.map((placement) => (
            <TableRow key={placement.id}>
              <TableCell>{placement.position}</TableCell>
              <TableCell>{placement.size}</TableCell>
              <TableCell>{placement.network}</TableCell>
              <TableCell>
                {placement.isActive ? 
                  <span className="text-green-600">Actif</span> : 
                  <span className="text-red-600">Inactif</span>
                }
              </TableCell>
              <TableCell>
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
