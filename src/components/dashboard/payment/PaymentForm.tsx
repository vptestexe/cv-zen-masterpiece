
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PAYMENT_AMOUNT } from "@/utils/downloads/types";

interface PaymentFormProps {
  onPayment: () => void;
  isInitialized: boolean;
  isProcessing: boolean;
}

export const PaymentForm = ({ onPayment, isInitialized, isProcessing }: PaymentFormProps) => {
  return (
    <div className="space-y-4">
      <p>
        Pour obtenir {2} téléchargements, veuillez effectuer un paiement de {PAYMENT_AMOUNT} FCFA.
      </p>
      <div className="flex flex-col items-center space-y-4">
        <Button 
          className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] gap-2"
          onClick={onPayment}
          disabled={!isInitialized || isProcessing}
        >
          <CreditCard className="h-4 w-4" />
          Payer maintenant
        </Button>
      </div>
    </div>
  );
};
