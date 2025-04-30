
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdSize } from "@/types/admin";

interface AdSizeSelectorProps {
  value: AdSize;
  onChange: (value: AdSize) => void;
}

export function AdSizeSelector({ value, onChange }: AdSizeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="size">Taille</Label>
      <Select
        value={value}
        onValueChange={(val) => onChange(val as AdSize)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner une taille" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="banner">Bannière (468x60)</SelectItem>
          <SelectItem value="rectangle">Rectangle (300x250)</SelectItem>
          <SelectItem value="leaderboard">Leaderboard (728x90)</SelectItem>
          <SelectItem value="skyscraper">Skyscraper (160x600)</SelectItem>
          <SelectItem value="mobile">Mobile (320x50)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
