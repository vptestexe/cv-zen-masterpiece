
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { usePaymentDialog } from "@/hooks/usePaymentDialog";
import { usePaymentInitialization } from "@/hooks/usePaymentInitialization";
import { PaymentLoading } from "./payment/PaymentLoading";
import { PaymentError } from "./payment/PaymentError";
import { PaymentSuccess } from "./payment/PaymentSuccess";
import { PaymentForm } from "./payment/PaymentForm";

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  cvId?: string | null;
}

const PaymentDialog = ({ open, onClose, cvId }: PaymentDialogProps) => {
  const { handleVerifyPayment, isProcessing, verificationStatus } = usePaymentDialog(onClose, cvId);
  const { isInitialized, isInitializing, initError, handleRetryInit } = usePaymentInitialization(open);
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!isInitialized || !cvId) {
      toast({
        title: "Erreur",
        description: "Le système de paiement n'est pas prêt",
        variant: "destructive"
      });
      return;
    }

    try {
      localStorage.setItem('cv_being_paid', cvId);
      console.log("Démarrage du processus de paiement pour CV:", cvId);
      window.PaiementPro.startPayment();
    } catch (error) {
      console.error("Erreur lors du paiement:", error);
      toast({
        title: "Erreur de paiement",
        description: "Impossible de démarrer le paiement",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Téléchargement de CV</DialogTitle>
          <DialogDescription>
            {verificationStatus === 'processing' ? (
              <div className="space-y-4">
                <p>Vérification du paiement en cours...</p>
                <Progress value={100} className="w-full" />
                <PaymentLoading message="Veuillez patienter pendant la vérification de votre paiement." />
              </div>
            ) : verificationStatus === 'success' ? (
              <PaymentSuccess />
            ) : verificationStatus === 'error' || verificationStatus === 'idle' ? (
              <>
                {isInitializing ? (
                  <PaymentLoading />
                ) : initError ? (
                  <PaymentError error={initError} onRetry={handleRetryInit} />
                ) : (
                  <PaymentForm 
                    onPayment={handlePayment}
                    isInitialized={isInitialized}
                    isProcessing={isProcessing || verificationStatus === 'processing'}
                  />
                )}
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
