
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCVContext } from "@/contexts/CVContext";
import { AtSign, Briefcase, Building, Phone, Plus, Trash2, User } from "lucide-react";

export function ReferencesForm() {
  const { cvData, addReference, updateReference, removeReference } = useCVContext();
  const { references } = cvData;

  return (
    <div className="space-y-6 animate-fade-in">
      {references.length === 0 ? (
        <div className="text-center py-8 bg-muted/40 rounded-lg">
          <User className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">
            Aucune référence ajoutée
          </p>
        </div>
      ) : (
        references.map((reference) => (
          <div key={reference.id} className="space-y-4 border rounded-lg p-4 relative animate-slide-in">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 text-muted-foreground hover:text-destructive"
              onClick={() => removeReference(reference.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div>
              <Label htmlFor={`reference-name-${reference.id}`}>Nom</Label>
              <div className="relative">
                <Input
                  id={`reference-name-${reference.id}`}
                  value={reference.name}
                  onChange={(e) => updateReference(reference.id, 'name', e.target.value)}
                  placeholder="Marie Durand"
                  className="pl-10"
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div>
              <Label htmlFor={`reference-position-${reference.id}`}>Poste</Label>
              <div className="relative">
                <Input
                  id={`reference-position-${reference.id}`}
                  value={reference.position}
                  onChange={(e) => updateReference(reference.id, 'position', e.target.value)}
                  placeholder="Directrice Technique"
                  className="pl-10"
                />
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div>
              <Label htmlFor={`reference-company-${reference.id}`}>Entreprise</Label>
              <div className="relative">
                <Input
                  id={`reference-company-${reference.id}`}
                  value={reference.company}
                  onChange={(e) => updateReference(reference.id, 'company', e.target.value)}
                  placeholder="Acme Inc."
                  className="pl-10"
                />
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`reference-email-${reference.id}`}>Email</Label>
                <div className="relative">
                  <Input
                    id={`reference-email-${reference.id}`}
                    value={reference.email}
                    onChange={(e) => updateReference(reference.id, 'email', e.target.value)}
                    placeholder="marie.durand@acme.com"
                    className="pl-10"
                  />
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div>
                <Label htmlFor={`reference-phone-${reference.id}`}>Téléphone</Label>
                <div className="relative">
                  <Input
                    id={`reference-phone-${reference.id}`}
                    value={reference.phone}
                    onChange={(e) => updateReference(reference.id, 'phone', e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                    className="pl-10"
                  />
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
        ))
      )}

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={addReference}
      >
        <Plus className="h-4 w-4 mr-2" />
        Ajouter une référence
      </Button>
    </div>
  );
}
