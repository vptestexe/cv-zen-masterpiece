
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { AdSize } from "@/types/admin";
import { useToast } from "@/components/ui/use-toast";

interface AdImageUploaderProps {
  imageUrl: string | null;
  imageFile: File | null;
  onImageChange: (file: File | null) => void;
  onImageRemove: () => void;
  size: AdSize;
}

export function AdImageUploader({ imageUrl, imageFile, onImageChange, onImageRemove, size }: AdImageUploaderProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(imageUrl);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  // Reset preview when imageUrl changes
  useEffect(() => {
    setImagePreview(imageUrl);
  }, [imageUrl]);

  const validateImageDimensions = (file: File, size: AdSize): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        
        const dimensionsBySize: Record<AdSize, { width: number, height: number }> = {
          'banner': { width: 468, height: 60 },
          'rectangle': { width: 300, height: 250 },
          'leaderboard': { width: 728, height: 90 },
          'skyscraper': { width: 160, height: 600 },
          'mobile': { width: 320, height: 50 }
        };
        
        const expectedDimensions = dimensionsBySize[size];
        const tolerance = 10; // tolérance de 10px
        
        const widthWithinRange = Math.abs(width - expectedDimensions.width) <= tolerance;
        const heightWithinRange = Math.abs(height - expectedDimensions.height) <= tolerance;
        
        resolve(widthWithinRange && heightWithinRange);
      };
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsValidating(true);
    
    try {
      // Vérifier les dimensions de l'image
      const isValid = await validateImageDimensions(file, size);
      
      if (!isValid) {
        toast({
          title: "Dimensions incorrectes",
          description: `L'image doit respecter les dimensions recommandées pour le format ${size}`,
          variant: "destructive"
        });
        setIsValidating(false);
        return;
      }
      
      onImageChange(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setIsValidating(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error validating image:", error);
      toast({
        title: "Erreur",
        description: "Impossible de valider l'image",
        variant: "destructive"
      });
      setIsValidating(false);
    }
  };

  const handleRemoveImage = () => {
    onImageRemove();
    setImagePreview(null);
  };

  const getSizeRecommendation = () => {
    switch(size) {
      case 'banner': return 'Bannière: 468x60 pixels';
      case 'rectangle': return 'Rectangle: 300x250 pixels';
      case 'leaderboard': return 'Leaderboard: 728x90 pixels';
      case 'skyscraper': return 'Skyscraper: 160x600 pixels';
      case 'mobile': return 'Mobile: 320x50 pixels';
      default: return '';
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="localImage">Image de l'annonce</Label>
      
      {(imagePreview || imageUrl) ? (
        <div className="relative border rounded-md p-2 h-56 flex justify-center">
          <img 
            src={imagePreview || imageUrl || ''} 
            alt="Prévisualisation" 
            className="max-h-full object-contain" 
          />
          <Button 
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2"
            onClick={handleRemoveImage}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border border-dashed border-gray-300 rounded-md p-6 text-center">
          <input
            type="file"
            id="localImage"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isValidating}
          />
          <label 
            htmlFor="localImage" 
            className="cursor-pointer flex flex-col items-center justify-center h-32"
          >
            {isValidating ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  Cliquez pour télécharger une image<br />
                  <span className="text-xs">JPG, PNG, GIF</span>
                </p>
              </>
            )}
          </label>
        </div>
      )}
      <p className="text-xs text-gray-500">
        Les dimensions recommandées dépendent du format sélectionné:<br />
        {getSizeRecommendation()}
      </p>
    </div>
  );
}
