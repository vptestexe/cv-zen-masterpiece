
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdNetwork } from "@/types/admin";

interface AdNetworkSelectorProps {
  value: AdNetwork;
  onChange: (value: AdNetwork) => void;
}

export function AdNetworkSelector({ value, onChange }: AdNetworkSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="network">Réseau</Label>
      <Select
        value={value}
        onValueChange={(val) => onChange(val as AdNetwork)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner un réseau" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="adsense">Google AdSense</SelectItem>
          <SelectItem value="direct">Direct (HTML)</SelectItem>
          <SelectItem value="local">Image locale</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
