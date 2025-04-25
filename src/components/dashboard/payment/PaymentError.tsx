
import { AlertTriangle, RefreshCw, ArrowLeft, Wifi, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentErrorProps {
  error: string;
  onRetry: () => void;
  onClose?: () => void;
}

export const PaymentError = ({ error, onRetry, onClose }: PaymentErrorProps) => {
  // Détermine quel type d'erreur pour afficher les bons conseils
  const isConnectivityError = error.includes("connexion") || error.includes("réseau");
  const isServiceError = error.includes("service") || error.includes("indisponible");
  
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 text-red-500">
        <AlertTriangle className="h-5 w-5" />
        <span className="font-medium">Problème de chargement</span>
      </div>
      
      <p className="text-sm text-center text-gray-700">{error}</p>
      
      {/* Suggestions spécifiques selon le type d'erreur */}
      <div className="bg-amber-50 p-3 rounded-md border border-amber-200 text-xs text-amber-800 w-full">
        {isConnectivityError ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <Wifi className="h-3 w-3" /> 
              <span className="font-medium">Conseils:</span>
            </div>
            <ul className="list-disc pl-4 space-y-1">
              <li>Vérifiez votre connexion internet</li>
              <li>Désactivez votre VPN ou pare-feu temporairement</li>
              <li>Essayez un autre réseau si possible</li>
            </ul>
          </div>
        ) : isServiceError ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <Globe className="h-3 w-3" /> 
              <span className="font-medium">Informations:</span>
            </div>
            <ul className="list-disc pl-4 space-y-1">
              <li>Le service de paiement semble temporairement indisponible</li>
              <li>Veuillez réessayer dans quelques minutes</li>
              <li>Si le problème persiste, contactez le support</li>
            </ul>
          </div>
        ) : (
          <div>
            <p>Si le problème persiste, essayez de rafraîchir la page ou utilisez un autre navigateur.</p>
          </div>
        )}
      </div>
      
      <div className="flex flex-col w-full gap-2">
        <Button 
          className="w-full bg-gray-200 text-gray-800 hover:bg-gray-300 gap-2"
          onClick={onRetry}
        >
          <RefreshCw className="h-4 w-4" />
          Réessayer
        </Button>
        
        {onClose && (
          <Button 
            variant="outline"
            className="w-full gap-2"
            onClick={onClose}
          >
            <ArrowLeft className="h-4 w-4" />
            Revenir au tableau de bord
          </Button>
        )}
      </div>
      
      <p className="text-xs text-gray-500 text-center mt-2">
        Si le problème persiste après plusieurs tentatives, veuillez contacter notre support technique 
        ou réessayer ultérieurement.
      </p>
    </div>
  );
};
