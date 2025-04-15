
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useCVContext } from "@/contexts/CVContext";
import { Code, Plus, Trash2 } from "lucide-react";

export function SkillsForm() {
  const { cvData, addSkill, updateSkill, removeSkill } = useCVContext();
  const { skills } = cvData;

  return (
    <div className="space-y-6 animate-fade-in">
      {skills.length === 0 ? (
        <div className="text-center py-8 bg-muted/40 rounded-lg">
          <Code className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">
            Aucune compétence ajoutée
          </p>
        </div>
      ) : (
        skills.map((skill) => (
          <div key={skill.id} className="space-y-4 border rounded-lg p-4 relative animate-slide-in">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 text-muted-foreground hover:text-destructive"
              onClick={() => removeSkill(skill.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div>
              <Label htmlFor={`skill-name-${skill.id}`}>Nom de la compétence</Label>
              <div className="relative">
                <Input
                  id={`skill-name-${skill.id}`}
                  value={skill.name}
                  onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                  placeholder="JavaScript, Gestion de projet, etc."
                  className="pl-10"
                />
                <Code className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <Label htmlFor={`skill-level-${skill.id}`}>Niveau</Label>
                <span className="text-xs text-muted-foreground">
                  {skill.level === 1 && "Débutant"}
                  {skill.level === 2 && "Intermédiaire"}
                  {skill.level === 3 && "Avancé"}
                  {skill.level === 4 && "Expert"}
                  {skill.level === 5 && "Maître"}
                </span>
              </div>
              <Slider
                id={`skill-level-${skill.id}`}
                value={[skill.level]}
                min={1}
                max={5}
                step={1}
                onValueChange={(value) => updateSkill(skill.id, 'level', value[0])}
              />
            </div>
          </div>
        ))
      )}

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={addSkill}
      >
        <Plus className="h-4 w-4 mr-2" />
        Ajouter une compétence
      </Button>
    </div>
  );
}
