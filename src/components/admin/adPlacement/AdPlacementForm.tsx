import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AdPlacement, AdPosition, AdSize, AdNetwork } from "@/types/admin";
import { useToast } from "@/components/ui/use-toast";
import { saveAdPlacement } from "@/services/adPlacement";

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
  const [error, setError] = useState<string | null>(null);
  
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
      setError(null);
      
      const adData = {
        id: placement?.id,
        position,
        size,
        network,
        isActive,
        startDate: startDate.toISOString(),
        endDate: endDate?.toISOString(),
        adCode: network === "local" ? null : adCode,
        imageUrl: network === "local" ? imageUrl : null,
      };
      
      const result = await saveAdPlacement(adData, localImage);
      
      if (result.success) {
        toast({
          title: "Succès",
          description: result.message,
        });
        onSave();
      } else {
        setError(result.message);
        toast({
          title: "Erreur",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error saving ad placement:", err);
      const errorMessage = err instanceof Error ? err.message : "Une erreur inconnue s'est produite";
      setError(errorMessage);
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
          
          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-50 rounded-md">
              {error}
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
            disabled={loading || (network === "local" && !localImage && !imageUrl)}
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
