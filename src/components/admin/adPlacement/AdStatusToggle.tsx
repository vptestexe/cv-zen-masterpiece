
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface AdStatusToggleProps {
  isActive: boolean;
  onChange: (isActive: boolean) => void;
}

export function AdStatusToggle({ isActive, onChange }: AdStatusToggleProps) {
  return (
    <div className="flex items-center space-x-2 pt-8">
      <Switch
        id="isActive"
        checked={isActive}
        onCheckedChange={onChange}
      />
      <Label htmlFor="isActive">Actif</Label>
    </div>
  );
}
