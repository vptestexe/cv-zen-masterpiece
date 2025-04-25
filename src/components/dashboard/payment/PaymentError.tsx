
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentErrorProps {
  error: string;
  onRetry: () => void;
  onClose?: () => void;
}

export const PaymentError = ({ error, onRetry, onClose }: PaymentErrorProps) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 text-red-500">
        <AlertTriangle className="h-5 w-5" />
        <span className="font-medium">Erreur de chargement</span>
      </div>
      
      <p className="text-sm text-center text-gray-700">{error}</p>
      
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
        Si le problème persiste après plusieurs tentatives, veuillez rafraîchir la page ou contacter notre support technique.
      </p>
    </div>
  );
};
