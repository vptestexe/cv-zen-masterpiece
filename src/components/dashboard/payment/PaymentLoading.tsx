
import { Loader2 } from "lucide-react";

interface PaymentLoadingProps {
  message?: string;
}

export const PaymentLoading = ({ message = "Initialisation du paiement..." }: PaymentLoadingProps) => {
  return (
    <div className="flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{message}</span>
    </div>
  );
};
