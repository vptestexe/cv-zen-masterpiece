
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AdCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  network: "adsense" | "direct";
}

export function AdCodeEditor({ value, onChange, network }: AdCodeEditorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="adCode">Code HTML de l'annonce</Label>
      <Textarea
        id="adCode"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={network === "adsense" ? "<script>...</script>" : "<a href='...'>...</a>"}
        className="h-32"
      />
    </div>
  );
}
