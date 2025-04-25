
import { Check } from "lucide-react";
import { PAID_DOWNLOADS_PER_CV } from "@/utils/downloads/types";

export const PaymentSuccess = () => {
  return (
    <div className="space-y-4 text-center">
      <div className="flex justify-center">
        <div className="bg-green-100 p-3 rounded-full">
          <Check className="h-8 w-8 text-green-600" />
        </div>
      </div>
      <p>Paiement confirmé! Votre téléchargement va démarrer automatiquement.</p>
      <p className="text-sm text-muted-foreground">
        Vous disposez maintenant de {PAID_DOWNLOADS_PER_CV} téléchargements pour ce CV.
      </p>
    </div>
  );
};
