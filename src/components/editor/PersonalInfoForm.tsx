
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCVContext } from "@/contexts/CVContext";
import { AtSign, Briefcase, Flag, Globe, Home, Linkedin, Phone, Github, Upload, Crop, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState, useRef, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countries } from "@/utils/countries";
import { PersonalInfoExtended } from "@/types/cv-extended";

export function PersonalInfoForm() {
  const { cvData, updatePersonalInfo } = useCVContext();
  const { personalInfo } = cvData;
  const [photoAdjustMode, setPhotoAdjustMode] = useState(false);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (personalInfo.nationality && typeof personalInfo.nationality === 'string') {
      // Convert string nationality to object if needed
      const matchingCountry = countries.find(c => 
        c.name.toLowerCase() === (personalInfo.nationality as unknown as string).toLowerCase()
      );
      
      if (matchingCountry) {
        // Use the properly typed updatePersonalInfo function
        updatePersonalInfo('nationality' as keyof PersonalInfoExtended, {
          code: matchingCountry.code,
          name: matchingCountry.name
        });
      }
    }
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updatePersonalInfo('profilePhoto', reader.result as string);
        setPhotoAdjustMode(true);
        setScale(1);
        setRotation(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRotatePhoto = () => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    applyPhotoAdjustments(scale, newRotation);
  };

  const handleZoomIn = () => {
    const newScale = Math.min(scale + 0.1, 2);
    setScale(newScale);
    applyPhotoAdjustments(newScale, rotation);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(scale - 0.1, 0.5);
    setScale(newScale);
    applyPhotoAdjustments(newScale, rotation);
  };

  const handleScaleChange = (value: number[]) => {
    const newScale = value[0];
    setScale(newScale);
    applyPhotoAdjustments(newScale, rotation);
  };

  const applyPhotoAdjustments = (newScale: number, newRotation: number) => {
    if (!personalInfo.profilePhoto) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      const size = Math.max(img.width, img.height);
      canvas.width = size;
      canvas.height = size;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((newRotation * Math.PI) / 180);
      ctx.scale(newScale, newScale);
      
      ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
      ctx.restore();
      
      const dataUrl = canvas.toDataURL('image/png');
      updatePersonalInfo('profilePhoto', dataUrl);
    };
    
    img.src = personalInfo.profilePhoto;
  };

  const handleCropComplete = () => {
    setPhotoAdjustMode(false);
  };

  const handleNationalityChange = (code: string) => {
    const country = countries.find(c => c.code === code);
    if (country) {
      // Update nationality with proper object structure
      updatePersonalInfo('nationality' as keyof PersonalInfoExtended, {
        code: country.code,
        name: country.name
      });
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nationality">Nationalité</Label>
          <div className="relative">
            <Select 
              value={personalInfo.nationality?.code || ""} 
              onValueChange={handleNationalityChange}
            >
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="Sélectionnez votre nationalité" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <div className="flex items-center">
                      <span 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: country.color }}
                      ></span>
                      {country.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Flag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div>
          <Label htmlFor="address">Adresse</Label>
          <div className="relative">
            <Input
              id="address"
              value={personalInfo.address}
              onChange={(e) => updatePersonalInfo('address', e.target.value)}
              className="pl-10"
              placeholder="Paris, France"
            />
            <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
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
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex items-center gap-4">
            {personalInfo.profilePhoto && (
              <div className="h-20 w-20 rounded-full overflow-hidden border bg-transparent flex-shrink-0">
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
                ref={inputRef}
              />
            </div>
          </div>

          {photoAdjustMode && personalInfo.profilePhoto && (
            <div className="bg-muted/20 p-4 rounded-md border space-y-4">
              <div className="text-sm font-medium mb-2">Ajustement de la photo</div>
              
              <div className="flex justify-center mb-4">
                <div className="h-40 w-40 rounded-full overflow-hidden border bg-transparent flex-shrink-0">
                  <img
                    src={personalInfo.profilePhoto}
                    alt="Profile"
                    className="h-full w-full object-cover transition-transform"
                    style={{ transform: `rotate(${rotation}deg) scale(${scale})` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRotatePhoto}
                  className="flex items-center"
                >
                  <RotateCw className="mr-2 h-4 w-4" />
                  Rotation
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCropComplete}
                  className="flex items-center"
                >
                  <Crop className="mr-2 h-4 w-4" />
                  Terminer
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="zoom">Zoom</Label>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={handleZoomOut}
                    >
                      <ZoomOut className="h-3 w-3" />
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={handleZoomIn}
                    >
                      <ZoomIn className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Slider
                  id="zoom"
                  value={[scale]}
                  min={0.5}
                  max={2}
                  step={0.01}
                  onValueChange={handleScaleChange}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
