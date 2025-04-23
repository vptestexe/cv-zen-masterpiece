
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { usePaymentDialog } from "@/hooks/usePaymentDialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { PAID_DOWNLOADS_PER_CV, PAYMENT_AMOUNT } from "@/utils/downloads/types";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Check, QrCode, CreditCard, Smartphone } from "lucide-react";

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  cvId?: string | null;
}

const PaymentDialog = ({ open, onClose, cvId }: PaymentDialogProps) => {
  const { handlePayment, handleVerifyPayment, isProcessing, verificationStatus, isWaveRedirect } = usePaymentDialog(onClose, cvId);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Show toast when verification is complete
  useEffect(() => {
    if (verificationStatus === 'success') {
      toast({
        title: "Paiement confirmé",
        description: "Votre paiement a été vérifié avec succès. Téléchargement disponible!",
      });
    } else if (verificationStatus === 'error') {
      toast({
        title: "Échec de la vérification",
        description: "Impossible de vérifier votre paiement. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  }, [verificationStatus, toast]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Téléchargement de CV</DialogTitle>
          <DialogDescription>
            {isProcessing ? (
              <div className="space-y-4">
                <p>Vérification du paiement en cours...</p>
                <Progress value={100} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  Veuillez patienter pendant la vérification de votre paiement.
                  Cette opération peut prendre jusqu'à 5 secondes.
                </p>
              </div>
            ) : verificationStatus === 'success' ? (
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
            ) : (
              <div className="space-y-4">
                <p>
                  Pour obtenir {PAID_DOWNLOADS_PER_CV} téléchargements, veuillez effectuer un paiement de {PAYMENT_AMOUNT} FCFA via Wave.
                </p>
                {!isMobile ? (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="border border-gray-200 p-4 rounded-lg bg-white">
                      <img 
                        src="/lovable-uploads/1c070811-a6f0-4e04-be67-11bc4226d5f9.png" 
                        alt="Code QR Wave" 
                        className="w-64 h-64 object-contain"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <QrCode className="h-4 w-4" />
                      <p>Scannez le code QR avec l'application Wave</p>
                    </div>
                    {isWaveRedirect ? (
                      <Button 
                        className="mt-4 w-full"
                        onClick={handleVerifyPayment}
                      >
                        J'ai payé, vérifier mon paiement
                      </Button>
                    ) : (
                      <p className="text-sm text-center text-muted-foreground mt-2">
                        Après avoir scanné et payé, revenez ici et cliquez sur "Vérifier mon paiement"
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-4">
                    <Button 
                      className="w-full bg-[#00b6f0] hover:bg-[#00a0d6] gap-2"
                      onClick={handlePayment}
                    >
                      <Smartphone className="h-4 w-4" />
                      Payer avec Wave
                    </Button>
                    {isWaveRedirect && (
                      <Button 
                        className="w-full gap-2"
                        onClick={handleVerifyPayment}
                      >
                        <CreditCard className="h-4 w-4" />
                        J'ai payé, vérifier mon paiement
                      </Button>
                    )}
                  </div>
                )}
                
                {verificationStatus === 'error' && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                    <p>La vérification du paiement a échoué. Veuillez vous assurer que vous avez bien effectué le paiement avant de cliquer sur "Vérifier mon paiement".</p>
                  </div>
                )}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
