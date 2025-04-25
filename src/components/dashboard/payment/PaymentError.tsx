
import { AlertTriangle, RefreshCw, ArrowLeft, Wifi, Globe, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

interface PaymentErrorProps {
  error: string;
  onRetry: () => void;
  onClose?: () => void;
}

export const PaymentError = ({ error, onRetry, onClose }: PaymentErrorProps) => {
  const isConnectivityError = error.toLowerCase().includes("connexion") || 
                            error.toLowerCase().includes("réseau") ||
                            error.toLowerCase().includes("internet");
  
  const isServiceError = error.toLowerCase().includes("service") || 
                        error.toLowerCase().includes("indisponible") ||
                        error.toLowerCase().includes("délai");
  
  const isSdkError = error.toLowerCase().includes("sdk") || 
                     error.toLowerCase().includes("script") ||
                     error.toLowerCase().includes("chargement");

  return (
    <div className="flex flex-col items-center gap-4">
      <Alert variant="destructive" className="w-full">
        <AlertTriangle className="h-5 w-5" />
        <div className="ml-2">
          <h4 className="font-medium">Problème de paiement</h4>
          <p className="text-sm">{error}</p>
        </div>
      </Alert>
      
      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 w-full">
        {isConnectivityError && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-800">
              <Wifi className="h-4 w-4" />
              <span className="font-medium">Problème de connexion</span>
            </div>
            <ul className="list-disc pl-5 text-sm text-amber-700 space-y-1">
              <li>Vérifiez votre connexion internet</li>
              <li>Désactivez temporairement votre VPN si vous en utilisez un</li>
              <li>Essayez de vous connecter à un autre réseau</li>
            </ul>
          </div>
        )}

        {isServiceError && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-800">
              <Server className="h-4 w-4" />
              <span className="font-medium">Service temporairement indisponible</span>
            </div>
            <ul className="list-disc pl-5 text-sm text-amber-700 space-y-1">
              <li>Le service de paiement est momentanément inaccessible</li>
              <li>Nos équipes ont été notifiées du problème</li>
              <li>Veuillez réessayer dans quelques minutes</li>
            </ul>
          </div>
        )}

        {isSdkError && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-800">
              <Globe className="h-4 w-4" />
              <span className="font-medium">Problème technique</span>
            </div>
            <ul className="list-disc pl-5 text-sm text-amber-700 space-y-1">
              <li>Le système de paiement n'a pas pu être initialisé</li>
              <li>Essayez de rafraîchir la page</li>
              <li>Si le problème persiste, utilisez un autre navigateur</li>
            </ul>
          </div>
        )}
      </div>

      <div className="flex flex-col w-full gap-2 mt-2">
        <Button 
          onClick={onRetry}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
        
        {onClose && (
          <Button 
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center">
        Si le problème persiste, contactez notre support technique
      </p>
    </div>
  );
};
