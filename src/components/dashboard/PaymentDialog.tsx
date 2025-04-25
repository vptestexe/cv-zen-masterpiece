
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { usePaymentDialog } from "@/hooks/usePaymentDialog";
import { Progress } from "@/components/ui/progress";
import { PAID_DOWNLOADS_PER_CV, PAYMENT_AMOUNT } from "@/utils/downloads/types";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Check, CreditCard, Loader2 } from "lucide-react";

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  cvId?: string | null;
}

declare global {
  interface Window {
    PaiementPro: any;
  }
}

const PaymentDialog = ({ open, onClose, cvId }: PaymentDialogProps) => {
  const { handleVerifyPayment, isProcessing, verificationStatus } = usePaymentDialog(onClose, cvId);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initRetries, setInitRetries] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    if (!open) return;
    
    const initializePaiementPro = async () => {
      if (isInitializing || isInitialized) return;
      
      setIsInitializing(true);
      
      try {
        // Add a small delay to ensure SDK is loaded
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!window.PaiementPro) {
          throw new Error("SDK PaiementPro non chargé");
        }

        // Replace with your actual merchant ID from your PaiementPro dashboard
        const merchantId = "PP-TEST-MERCHANT"; // Use your real merchant ID in production
        
        if (!merchantId) {
          throw new Error("ID marchand non configuré");
        }

        window.PaiementPro.init({
          merchantId: merchantId,
          amount: PAYMENT_AMOUNT,
          description: "Téléchargement CV",
          callbackUrl: window.location.origin + "/dashboard",
        });

        setIsInitialized(true);
        setIsInitializing(false);
      } catch (error) {
        console.error("Erreur d'initialisation PaiementPro:", error);
        
        if (initRetries < MAX_RETRIES) {
          setInitRetries(prev => prev + 1);
          setTimeout(initializePaiementPro, 2000); // Retry after 2 seconds
        } else {
          toast({
            title: "Erreur de configuration",
            description: "Impossible d'initialiser le système de paiement. Veuillez rafraîchir la page.",
            variant: "destructive"
          });
        }
        setIsInitializing(false);
      }
    };

    initializePaiementPro();
  }, [open, toast, initRetries, isInitialized, isInitializing]);

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
            {isProcessing ? (
              <div className="space-y-4">
                <p>Vérification du paiement en cours...</p>
                <Progress value={100} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  Veuillez patienter pendant la vérification de votre paiement.
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
                  Pour obtenir {PAID_DOWNLOADS_PER_CV} téléchargements, veuillez effectuer un paiement de {PAYMENT_AMOUNT} FCFA.
                </p>
                <div className="flex flex-col items-center space-y-4">
                  {isInitializing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Initialisation du paiement...</span>
                    </div>
                  ) : (
                    <Button 
                      className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] gap-2"
                      onClick={handlePayment}
                      disabled={!isInitialized || isProcessing}
                    >
                      <CreditCard className="h-4 w-4" />
                      Payer maintenant
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
