
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCVContext } from "@/contexts/CVContext";
import { BookOpen, CalendarRange, MapPin, Plus, Trash2 } from "lucide-react";

export function EducationForm() {
  const { cvData, addEducation, updateEducation, removeEducation } = useCVContext();
  const { educations } = cvData;

  return (
    <div className="space-y-6 animate-fade-in">
      {educations.length === 0 ? (
        <div className="text-center py-8 bg-muted/40 rounded-lg">
          <BookOpen className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">
            Aucune formation ajoutée
          </p>
        </div>
      ) : (
        educations.map((education) => (
          <div key={education.id} className="space-y-4 border rounded-lg p-4 relative animate-slide-in">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 text-muted-foreground hover:text-destructive"
              onClick={() => removeEducation(education.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div>
              <Label htmlFor={`degree-${education.id}`}>Diplôme / Certification</Label>
              <div className="relative">
                <Input
                  id={`degree-${education.id}`}
                  value={education.degree}
                  onChange={(e) => updateEducation(education.id, 'degree', e.target.value)}
                  placeholder="Master en Informatique"
                  className="pl-10"
                />
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div>
              <Label htmlFor={`institution-${education.id}`}>Établissement</Label>
              <Input
                id={`institution-${education.id}`}
                value={education.institution}
                onChange={(e) => updateEducation(education.id, 'institution', e.target.value)}
                placeholder="Université de Paris"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`startDate-${education.id}`}>Date de début</Label>
                <div className="relative">
                  <Input
                    id={`startDate-${education.id}`}
                    value={education.startDate}
                    onChange={(e) => updateEducation(education.id, 'startDate', e.target.value)}
                    placeholder="Sept. 2018"
                    className="pl-10"
                  />
                  <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div>
                <Label htmlFor={`endDate-${education.id}`}>Date de fin</Label>
                <Input
                  id={`endDate-${education.id}`}
                  value={education.endDate}
                  onChange={(e) => updateEducation(education.id, 'endDate', e.target.value)}
                  placeholder="Juin 2020"
                />
              </div>
            </div>

            <div>
              <Label htmlFor={`location-${education.id}`}>Lieu</Label>
              <div className="relative">
                <Input
                  id={`location-${education.id}`}
                  value={education.location}
                  onChange={(e) => updateEducation(education.id, 'location', e.target.value)}
                  placeholder="Paris, France"
                  className="pl-10"
                />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div>
              <Label htmlFor={`description-${education.id}`}>Description</Label>
              <Textarea
                id={`description-${education.id}`}
                value={education.description}
                onChange={(e) => updateEducation(education.id, 'description', e.target.value)}
                placeholder="Détails sur le programme, les projets importants, etc."
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
        onClick={addEducation}
      >
        <Plus className="h-4 w-4 mr-2" />
        Ajouter une formation
      </Button>
    </div>
  );
}
