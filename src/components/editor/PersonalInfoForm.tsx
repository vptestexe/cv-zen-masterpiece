
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCVContext } from "@/contexts/CVContext";
import { AtSign, Briefcase, Globe, Home, Linkedin, Phone, Github, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PersonalInfoForm() {
  const { cvData, updatePersonalInfo } = useCVContext();
  const { personalInfo } = cvData;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updatePersonalInfo('profilePhoto', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <Label htmlFor="fullName">Nom complet</Label>
        <Input
          id="fullName"
          value={personalInfo.fullName}
          onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
          placeholder="Jean Dupont"
        />
      </div>

      <div>
        <Label htmlFor="jobTitle">Titre / Poste</Label>
        <div className="relative">
          <Input
            id="jobTitle"
            value={personalInfo.jobTitle}
            onChange={(e) => updatePersonalInfo('jobTitle', e.target.value)}
            className="pl-10"
            placeholder="Développeur Web Senior"
          />
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Adresse</Label>
        <div className="relative">
          <Textarea
            id="address"
            value={personalInfo.address}
            onChange={(e) => updatePersonalInfo('address', e.target.value)}
            className="resize-none pl-10 pt-2"
            placeholder="Paris, France"
            rows={2}
          />
          <Home className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Téléphone</Label>
          <div className="relative">
            <Input
              id="phone"
              value={personalInfo.phone}
              onChange={(e) => updatePersonalInfo('phone', e.target.value)}
              className="pl-10"
              placeholder="+33 6 12 34 56 78"
            />
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={personalInfo.email}
              onChange={(e) => updatePersonalInfo('email', e.target.value)}
              className="pl-10"
              placeholder="jean.dupont@example.com"
            />
            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="linkedin">LinkedIn (optionnel)</Label>
        <div className="relative">
          <Input
            id="linkedin"
            value={personalInfo.linkedin || ''}
            onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
            className="pl-10"
            placeholder="https://linkedin.com/in/jeandupont"
          />
          <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div>
        <Label htmlFor="github">GitHub (optionnel)</Label>
        <div className="relative">
          <Input
            id="github"
            value={personalInfo.github || ''}
            onChange={(e) => updatePersonalInfo('github', e.target.value)}
            className="pl-10"
            placeholder="https://github.com/jeandupont"
          />
          <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div>
        <Label htmlFor="portfolio">Portfolio (optionnel)</Label>
        <div className="relative">
          <Input
            id="portfolio"
            value={personalInfo.portfolio || ''}
            onChange={(e) => updatePersonalInfo('portfolio', e.target.value)}
            className="pl-10"
            placeholder="https://jeandupont.fr"
          />
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div>
        <Label htmlFor="photo">Photo de profil (optionnel)</Label>
        <div className="flex items-center gap-4 mt-2">
          {personalInfo.profilePhoto && (
            <div className="h-20 w-20 rounded-full overflow-hidden border bg-muted flex-shrink-0">
              <img
                src={personalInfo.profilePhoto}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="flex-grow">
            <label htmlFor="photo-upload">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer w-full justify-start"
                asChild
              >
                <div>
                  <Upload className="mr-2 h-4 w-4" />
                  {personalInfo.profilePhoto ? "Changer la photo" : "Ajouter une photo"}
                </div>
              </Button>
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
