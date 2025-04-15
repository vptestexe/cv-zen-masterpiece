
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCVContext } from "@/contexts/CVContext";

export function SummaryForm() {
  const { cvData, updateSummary } = useCVContext();

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <Label htmlFor="summary">Profil / Résumé</Label>
        <Textarea
          id="summary"
          value={cvData.summary}
          onChange={(e) => updateSummary(e.target.value)}
          placeholder="Développeur web passionné avec 5 ans d'expérience dans la création d'applications web modernes et réactives. Fort d'une expertise en JavaScript, React et Node.js..."
          className="min-h-[150px] resize-none"
        />
      </div>
    </div>
  );
}
