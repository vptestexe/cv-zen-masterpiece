
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCVContext } from "@/contexts/CVContext";
import { Briefcase, CalendarRange, MapPin, Plus, Trash2 } from "lucide-react";

export function WorkExperienceForm() {
  const { cvData, addWorkExperience, updateWorkExperience, removeWorkExperience } = useCVContext();
  const { workExperiences } = cvData;

  return (
    <div className="space-y-6 animate-fade-in">
      {workExperiences.length === 0 ? (
        <div className="text-center py-8 bg-muted/40 rounded-lg">
          <Briefcase className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">
            Aucune expérience professionnelle ajoutée
          </p>
        </div>
      ) : (
        workExperiences.map((experience, index) => (
          <div key={experience.id} className="space-y-4 border rounded-lg p-4 relative animate-slide-in">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 text-muted-foreground hover:text-destructive"
              onClick={() => removeWorkExperience(experience.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div>
              <Label htmlFor={`position-${experience.id}`}>Poste</Label>
              <div className="relative">
                <Input
                  id={`position-${experience.id}`}
                  value={experience.position}
                  onChange={(e) => updateWorkExperience(experience.id, 'position', e.target.value)}
                  placeholder="Développeur Web Senior"
                  className="pl-10"
                />
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div>
              <Label htmlFor={`company-${experience.id}`}>Entreprise</Label>
              <Input
                id={`company-${experience.id}`}
                value={experience.company}
                onChange={(e) => updateWorkExperience(experience.id, 'company', e.target.value)}
                placeholder="Nom de l'entreprise"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`startDate-${experience.id}`}>Date de début</Label>
                <div className="relative">
                  <Input
                    id={`startDate-${experience.id}`}
                    value={experience.startDate}
                    onChange={(e) => updateWorkExperience(experience.id, 'startDate', e.target.value)}
                    placeholder="Janv. 2020"
                    className="pl-10"
                  />
                  <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div>
                <Label htmlFor={`endDate-${experience.id}`}>Date de fin</Label>
                <Input
                  id={`endDate-${experience.id}`}
                  value={experience.endDate}
                  onChange={(e) => updateWorkExperience(experience.id, 'endDate', e.target.value)}
                  placeholder="Présent"
                />
              </div>
            </div>

            <div>
              <Label htmlFor={`location-${experience.id}`}>Lieu</Label>
              <div className="relative">
                <Input
                  id={`location-${experience.id}`}
                  value={experience.location}
                  onChange={(e) => updateWorkExperience(experience.id, 'location', e.target.value)}
                  placeholder="Paris, France"
                  className="pl-10"
                />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div>
              <Label htmlFor={`description-${experience.id}`}>Description</Label>
              <Textarea
                id={`description-${experience.id}`}
                value={experience.description}
                onChange={(e) => updateWorkExperience(experience.id, 'description', e.target.value)}
                placeholder="Décrivez vos responsabilités et réalisations..."
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>
        ))
      )}

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={addWorkExperience}
      >
        <Plus className="h-4 w-4 mr-2" />
        Ajouter une expérience
      </Button>
    </div>
  );
}
