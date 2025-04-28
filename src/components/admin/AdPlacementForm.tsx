
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AdPlacement, AdPosition, AdSize, AdNetwork } from "@/types/admin";

interface AdPlacementFormProps {
  placement?: AdPlacement | null;
  onClose: () => void;
  onSave: () => void;
}

export default function AdPlacementForm({ placement, onClose, onSave }: AdPlacementFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    position: placement?.position || "top" as AdPosition,
    size: placement?.size || "banner" as AdSize,
    network: placement?.network || "adsense" as AdNetwork,
    isActive: placement?.isActive ?? true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    try {
      // Simulation pour démonstration - en réalité, nous aurions besoin de configurer correctement Supabase
      if (placement?.id) {
        // Update existant
        console.log("Mise à jour de l'emplacement publicitaire:", {
          id: placement.id,
          ...formData,
          updated_at: new Date().toISOString(),
        });
        
        toast({
          title: "Succès",
          description: "L'emplacement publicitaire a été mis à jour",
        });
      } else {
        // Nouvel emplacement
        console.log("Création d'un nouvel emplacement publicitaire:", {
          ...formData,
          created_at: new Date().toISOString(),
          user_id: user.id,
        });
        
        toast({
          title: "Succès",
          description: "L'emplacement publicitaire a été créé",
        });
      }

      onSave();
    } catch (error) {
      console.error("Error saving ad placement:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={() => !loading && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {placement ? "Modifier l'emplacement" : "Nouvel emplacement"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Select
              value={formData.position}
              onValueChange={(value: AdPosition) => 
                setFormData(prev => ({ ...prev, position: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir une position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Haut</SelectItem>
                <SelectItem value="bottom">Bas</SelectItem>
                <SelectItem value="sidebar">Barre latérale</SelectItem>
                <SelectItem value="inline">Dans le contenu</SelectItem>
                <SelectItem value="fixed">Fixe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="size">Taille</Label>
            <Select
              value={formData.size}
              onValueChange={(value: AdSize) => 
                setFormData(prev => ({ ...prev, size: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir une taille" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="banner">Bannière</SelectItem>
                <SelectItem value="rectangle">Rectangle</SelectItem>
                <SelectItem value="leaderboard">Grand format</SelectItem>
                <SelectItem value="skyscraper">Skyscraper</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="network">Réseau publicitaire</Label>
            <Select
              value={formData.network}
              onValueChange={(value: AdNetwork) => 
                setFormData(prev => ({ ...prev, network: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un réseau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="adsense">Google AdSense</SelectItem>
                <SelectItem value="direct">Direct</SelectItem>
                <SelectItem value="local">Local</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Actif</Label>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, isActive: checked }))
              }
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Enregistrement...
                </span>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
