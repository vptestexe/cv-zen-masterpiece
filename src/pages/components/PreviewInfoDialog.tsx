
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import React from "react";

interface PreviewInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PreviewInfoDialog = ({ open, onOpenChange }: PreviewInfoDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Conseils pour l'aperçu</DialogTitle>
        <DialogDescription>
          Pour améliorer la qualité de l'aperçu de votre CV, voici quelques conseils :
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-1">1. Si l'aperçu n'est pas à jour :</h3>
          <p className="text-muted-foreground text-sm">
            Cliquez sur "Sauvegarder" pour rafraîchir l'aperçu avec vos dernières modifications.
          </p>
        </div>
        <div>
          <h3 className="font-medium mb-1">2. Pour les photos de profil :</h3>
          <p className="text-muted-foreground text-sm">
            Utilisez les outils d'ajustement de photo pour obtenir le cadrage parfait.
          </p>
        </div>
        <div>
          <h3 className="font-medium mb-1">3. Téléchargement :</h3>
          <p className="text-muted-foreground text-sm">
            Le CV téléchargé peut légèrement différer de l'aperçu à l'écran, mais conservera toutes vos informations.
          </p>
        </div>
        <Button onClick={() => onOpenChange(false)} className="w-full">J'ai compris</Button>
      </div>
    </DialogContent>
  </Dialog>
);
