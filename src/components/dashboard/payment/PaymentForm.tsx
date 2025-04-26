
import { CreditCard, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PAYMENT_AMOUNT } from "@/utils/downloads/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymentFormProps {
  onPayment: () => void;
  isInitialized: boolean;
  isProcessing: boolean;
}

export const PaymentForm = ({ onPayment, isInitialized, isProcessing }: PaymentFormProps) => {
  return (
    <div className="space-y-4">
      <p>
        Pour obtenir 2 téléchargements, veuillez effectuer un paiement de {PAYMENT_AMOUNT} FCFA.
      </p>
      
      {!isInitialized && (
        <Alert variant="warning" className="bg-amber-50 border-amber-300">
          <AlertDescription className="text-amber-800">
            Initialisation du système de paiement en cours...
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col items-center space-y-4">
        <Button 
          className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] gap-2"
          onClick={onPayment}
          disabled={!isInitialized || isProcessing}
        >
          {isProcessing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Traitement en cours...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              Payer maintenant
            </>
          )}
        </Button>
        
        {!isInitialized && (
          <p className="text-xs text-gray-500">
            Le système de paiement est en cours d'initialisation, veuillez patienter...
          </p>
        )}
      </div>
    </div>
  );
};
