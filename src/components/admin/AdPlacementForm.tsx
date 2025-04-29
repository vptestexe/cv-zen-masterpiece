
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AdPlacement, AdPosition, AdSize, AdNetwork } from "@/types/admin";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Upload, Trash2 } from "lucide-react";

export default function AdPlacementForm({ 
  placement, 
  onClose, 
  onSave 
}: { 
  placement: AdPlacement | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [position, setPosition] = useState<AdPosition>(placement?.position || "top");
  const [size, setSize] = useState<AdSize>(placement?.size || "banner");
  const [network, setNetwork] = useState<AdNetwork>(placement?.network || "direct");
  const [isActive, setIsActive] = useState<boolean>(placement?.isActive ?? true);
  const [startDate, setStartDate] = useState<Date>(placement?.startDate ? new Date(placement?.startDate) : new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(placement?.endDate ? new Date(placement?.endDate) : undefined);
  const [adCode, setAdCode] = useState<string>(placement?.adCode || "");
  const [localImage, setLocalImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(placement?.imageUrl || null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  const { toast } = useToast();

  useEffect(() => {
    // Reset form when network changes
    if (network === "local") {
      setAdCode("");
    } else if (network === "adsense" || network === "direct") {
      setLocalImage(null);
      setImagePreview(null);
    }
  }, [network]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLocalImage(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setLocalImage(null);
    setImagePreview(null);
    setImageUrl(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      let finalImageUrl = imageUrl;
      
      // If we have a new local image, upload it first
      if (localImage && network === "local") {
        // Generate a unique file path
        const filePath = `ads/${Date.now()}_${localImage.name.replace(/\s+/g, '_')}`;
        
        // Upload the image to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('ads')
          .upload(filePath, localImage, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) {
          throw uploadError;
        }
        
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('ads')
          .getPublicUrl(filePath);
        
        finalImageUrl = publicUrl;
      }
      
      const adData = {
        position,
        size,
        network,
        is_active: isActive,
        start_date: startDate.toISOString(),
        end_date: endDate?.toISOString() || null,
        ad_code: network === "local" ? null : adCode,
        image_url: network === "local" ? finalImageUrl : null,
        updated_at: new Date().toISOString()
      };
      
      if (placement?.id) {
        // Update existing ad placement
        const { error } = await supabase
          .from('ad_placements')
          .update(adData)
          .eq('id', placement.id);
          
        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "L'emplacement publicitaire a été mis à jour",
        });
      } else {
        // Create new ad placement
        const { error } = await supabase
          .from('ad_placements')
          .insert({
            ...adData,
            created_at: new Date().toISOString()
          });
          
        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "L'emplacement publicitaire a été créé",
        });
      }
      
      onSave();
    } catch (error) {
      console.error("Error saving ad placement:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'emplacement publicitaire",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {placement ? "Modifier l'emplacement publicitaire" : "Nouvel emplacement publicitaire"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Select
                value={position}
                onValueChange={(val) => setPosition(val as AdPosition)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Haut</SelectItem>
                  <SelectItem value="bottom">Bas</SelectItem>
                  <SelectItem value="sidebar">Barre latérale</SelectItem>
                  <SelectItem value="inline">Dans le contenu</SelectItem>
                  <SelectItem value="fixed">Fixe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="size">Taille</Label>
              <Select
                value={size}
                onValueChange={(val) => setSize(val as AdSize)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une taille" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="banner">Bannière (468x60)</SelectItem>
                  <SelectItem value="rectangle">Rectangle (300x250)</SelectItem>
                  <SelectItem value="leaderboard">Leaderboard (728x90)</SelectItem>
                  <SelectItem value="skyscraper">Skyscraper (160x600)</SelectItem>
                  <SelectItem value="mobile">Mobile (320x50)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="network">Réseau</Label>
              <Select
                value={network}
                onValueChange={(val) => setNetwork(val as AdNetwork)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un réseau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adsense">Google AdSense</SelectItem>
                  <SelectItem value="direct">Direct (HTML)</SelectItem>
                  <SelectItem value="local">Image locale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="isActive">Actif</Label>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date de début</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'dd/MM/yyyy', { locale: fr }) : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Date de fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'dd/MM/yyyy', { locale: fr }) : "Aucune date de fin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* Conditional field based on network type */}
          {(network === "adsense" || network === "direct") && (
            <div className="space-y-2">
              <Label htmlFor="adCode">Code HTML de l'annonce</Label>
              <Textarea
                id="adCode"
                value={adCode}
                onChange={(e) => setAdCode(e.target.value)}
                placeholder={network === "adsense" ? "<script>...</script>" : "<a href='...'>...</a>"}
                className="h-32"
              />
            </div>
          )}
          
          {network === "local" && (
            <div className="space-y-2">
              <Label htmlFor="localImage">Image de l'annonce</Label>
              
              {imagePreview || imageUrl ? (
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
                  />
                  <label 
                    htmlFor="localImage" 
                    className="cursor-pointer flex flex-col items-center justify-center h-32"
                  >
                    <Upload className="h-10 w-10 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Cliquez pour télécharger une image<br />
                      <span className="text-xs">JPG, PNG, GIF</span>
                    </p>
                  </label>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Les dimensions recommandées dépendent du format sélectionné:<br />
                {size === 'banner' && 'Bannière: 468x60 pixels'}
                {size === 'rectangle' && 'Rectangle: 300x250 pixels'}
                {size === 'leaderboard' && 'Leaderboard: 728x90 pixels'}
                {size === 'skyscraper' && 'Skyscraper: 160x600 pixels'}
                {size === 'mobile' && 'Mobile: 320x50 pixels'}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSave}
            disabled={loading || (network === "local" && !imagePreview && !imageUrl)}
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
