
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AdPlacement, AdPosition, AdSize, AdNetwork } from "@/types/admin";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

// Import our new components
import { AdPositionSelector } from "./AdPositionSelector";
import { AdSizeSelector } from "./AdSizeSelector";
import { AdNetworkSelector } from "./AdNetworkSelector";
import { AdStatusToggle } from "./AdStatusToggle";
import { AdDatePicker } from "./AdDatePicker";
import { AdCodeEditor } from "./AdCodeEditor";
import { AdImageUploader } from "./AdImageUploader";

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
  const [loading, setLoading] = useState<boolean>(false);
  
  const { toast } = useToast();

  useEffect(() => {
    // Reset form when network changes
    if (network === "local") {
      setAdCode("");
    } else if (network === "adsense" || network === "direct") {
      setLocalImage(null);
    }
  }, [network]);

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
            <AdPositionSelector value={position} onChange={setPosition} />
            <AdSizeSelector value={size} onChange={setSize} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <AdNetworkSelector value={network} onChange={setNetwork} />
            <AdStatusToggle isActive={isActive} onChange={setIsActive} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <AdDatePicker
              label="Date de début"
              date={startDate}
              onSelect={(date) => date && setStartDate(date)}
            />
            
            <AdDatePicker
              label="Date de fin"
              date={endDate}
              onSelect={setEndDate}
              placeholder="Aucune date de fin"
            />
          </div>
          
          {/* Conditional field based on network type */}
          {(network === "adsense" || network === "direct") && (
            <AdCodeEditor
              value={adCode}
              onChange={setAdCode}
              network={network}
            />
          )}
          
          {network === "local" && (
            <AdImageUploader
              imageUrl={imageUrl}
              imageFile={localImage}
              onImageChange={setLocalImage}
              onImageRemove={() => {
                setLocalImage(null);
                setImageUrl(null);
              }}
              size={size}
            />
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
            disabled={loading || (network === "local" && !localImage && !imageUrl)}
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
