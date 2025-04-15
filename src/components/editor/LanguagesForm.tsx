
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCVContext } from "@/contexts/CVContext";
import { Globe, Plus, Trash2 } from "lucide-react";

const languageLevels = [
  "Débutant",
  "Intermédiaire",
  "Courant",
  "Bilingue",
  "Langue maternelle",
];

export function LanguagesForm() {
  const { cvData, addLanguage, updateLanguage, removeLanguage } = useCVContext();
  const { languages } = cvData;

  return (
    <div className="space-y-6 animate-fade-in">
      {languages.length === 0 ? (
        <div className="text-center py-8 bg-muted/40 rounded-lg">
          <Globe className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">
            Aucune langue ajoutée
          </p>
        </div>
      ) : (
        languages.map((language) => (
          <div key={language.id} className="space-y-4 border rounded-lg p-4 relative animate-slide-in">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 text-muted-foreground hover:text-destructive"
              onClick={() => removeLanguage(language.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div>
              <Label htmlFor={`language-name-${language.id}`}>Langue</Label>
              <div className="relative">
                <Input
                  id={`language-name-${language.id}`}
                  value={language.name}
                  onChange={(e) => updateLanguage(language.id, 'name', e.target.value)}
                  placeholder="Français, Anglais, etc."
                  className="pl-10"
                />
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div>
              <Label htmlFor={`language-level-${language.id}`}>Niveau</Label>
              <Select
                value={language.level}
                onValueChange={(value) => 
                  updateLanguage(language.id, 'level', value as any)
                }
              >
                <SelectTrigger id={`language-level-${language.id}`}>
                  <SelectValue placeholder="Sélectionnez un niveau" />
                </SelectTrigger>
                <SelectContent>
                  {languageLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))
      )}

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={addLanguage}
      >
        <Plus className="h-4 w-4 mr-2" />
        Ajouter une langue
      </Button>
    </div>
  );
}
