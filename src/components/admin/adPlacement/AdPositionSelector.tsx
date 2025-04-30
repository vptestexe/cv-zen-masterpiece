
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdPosition } from "@/types/admin";

interface AdPositionSelectorProps {
  value: AdPosition;
  onChange: (value: AdPosition) => void;
}

export function AdPositionSelector({ value, onChange }: AdPositionSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="position">Position</Label>
      <Select
        value={value}
        onValueChange={(val) => onChange(val as AdPosition)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner une position" />
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
  );
}
