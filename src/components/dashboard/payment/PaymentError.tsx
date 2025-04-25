
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentErrorProps {
  error: string;
  onRetry: () => void;
}

export const PaymentError = ({ error, onRetry }: PaymentErrorProps) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 text-red-500">
        <AlertTriangle className="h-5 w-5" />
        <span>{error}</span>
      </div>
      <Button 
        className="w-full bg-gray-200 text-gray-800 hover:bg-gray-300 gap-2"
        onClick={onRetry}
      >
        <RefreshCw className="h-4 w-4" />
        Réessayer l'initialisation
      </Button>
    </div>
  );
};
