
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCVContext } from "@/contexts/CVContext";
import { Heart, Plus, Trash2 } from "lucide-react";

export function InterestsForm() {
  const { cvData, addInterest, updateInterest, removeInterest } = useCVContext();
  const { interests } = cvData;

  return (
    <div className="space-y-6 animate-fade-in">
      {interests.length === 0 ? (
        <div className="text-center py-8 bg-muted/40 rounded-lg">
          <Heart className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">
            Aucun centre d'intérêt ajouté
          </p>
        </div>
      ) : (
        interests.map((interest) => (
          <div key={interest.id} className="space-y-4 border rounded-lg p-4 relative animate-slide-in">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 text-muted-foreground hover:text-destructive"
              onClick={() => removeInterest(interest.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div>
              <Label htmlFor={`interest-name-${interest.id}`}>Centre d'intérêt</Label>
              <div className="relative">
                <Input
                  id={`interest-name-${interest.id}`}
                  value={interest.name}
                  onChange={(e) => updateInterest(interest.id, 'name', e.target.value)}
                  placeholder="Photographie, Randonnée, Lecture, etc."
                  className="pl-10"
                />
                <Heart className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        ))
      )}

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={addInterest}
      >
        <Plus className="h-4 w-4 mr-2" />
        Ajouter un centre d'intérêt
      </Button>
    </div>
  );
}
