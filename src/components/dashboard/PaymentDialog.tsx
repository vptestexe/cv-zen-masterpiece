
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { usePaymentDialog } from "@/hooks/usePaymentDialog";
import { Progress } from "@/components/ui/progress";
import { PAID_DOWNLOADS_PER_CV, PAYMENT_AMOUNT } from "@/utils/downloads/types";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Check, CreditCard, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const [initError, setInitError] = useState<string | null>(null);
  const [initRetries, setInitRetries] = useState(0);
  const MAX_RETRIES = 3;

  // Force re-initialization when dialog is re-opened
  useEffect(() => {
    if (open) {
      setIsInitialized(false);
      setInitializing(false);
      setInitError(null);
      setInitRetries(0);
    }
  }, [open]);

  // Separate initialization state setter to prevent race conditions
  const setInitializing = (value: boolean) => {
    setIsInitializing(value);
    if (!value) {
      // Add a small delay to ensure UI updates properly
      setTimeout(() => {
        console.log("Initialization state reset completed");
      }, 100);
    }
  };

  useEffect(() => {
    if (!open) return;
    
    const initializePaiementPro = async () => {
      if (isInitializing) return;
      
      setInitializing(true);
      setInitError(null);
      
      console.log("Tentative d'initialisation PaiementPro...", { retries: initRetries });
      
      try {
        // Slightly longer delay to ensure SDK is fully loaded
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (!window.PaiementPro) {
          throw new Error("SDK PaiementPro non chargé");
        }

        // Retrieve merchant ID from Supabase environment variable
        const { data: secretData, error: secretError } = await supabase.functions.invoke(
          "get-payment-config",
          {
            body: { secret_name: "PAIEMENTPRO_MERCHANT_ID" }
          }
        );
        
        const merchantId = secretData?.value;
        
        if (secretError || !merchantId) {
          console.error("Erreur de récupération de l'ID marchand:", secretError);
          throw new Error("ID marchand non configuré. Veuillez vérifier vos paramètres.");
        }

        console.log("Initialisation avec ID marchand...");
        
        window.PaiementPro.init({
          merchantId: merchantId,
          amount: PAYMENT_AMOUNT,
          description: "Téléchargement CV",
          callbackUrl: window.location.origin + "/dashboard",
        });

        setIsInitialized(true);
        setInitializing(false);
        console.log("PaiementPro initialisé avec succès");
      } catch (error) {
        console.error("Erreur d'initialisation PaiementPro:", error);
        
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        setInitError(errorMessage);
        
        if (initRetries < MAX_RETRIES) {
          const nextRetry = initRetries + 1;
          setInitRetries(nextRetry);
          console.log(`Réessai d'initialisation (${nextRetry}/${MAX_RETRIES}) dans 2 secondes...`);
          setTimeout(initializePaiementPro, 2000); // Retry after 2 seconds
        } else {
          toast({
            title: "Erreur de configuration",
            description: "Impossible d'initialiser le système de paiement. Veuillez réessayer plus tard.",
            variant: "destructive"
          });
          setInitializing(false);
        }
      }
    };

    // Small delay before initialization to ensure component is fully mounted
    const timer = setTimeout(() => {
      if (!isInitialized && !isInitializing) {
        initializePaiementPro();
      }
    }, 500);

    return () => {
      clearTimeout(timer);
    };
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

  const handleRetryInit = () => {
    setIsInitialized(false);
    setInitializing(false);
    setInitError(null);
    setInitRetries(0);
    
    // Small delay before reinitialization
    setTimeout(() => {
      if (open) {
        console.log("Réinitialisation manuelle du processus de paiement");
        // Force script reload
        const oldScript = document.querySelector('script[src*="paiementpro.min.js"]');
        if (oldScript) {
          oldScript.remove();
          const newScript = document.createElement('script');
          newScript.src = "https://js.paiementpro.net/v1/paiementpro.min.js";
          newScript.defer = true;
          document.body.appendChild(newScript);
        }
      }
    }, 300);
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
                  ) : initError ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex items-center gap-2 text-red-500">
                        <AlertTriangle className="h-5 w-5" />
                        <span>{initError}</span>
                      </div>
                      <Button 
                        className="w-full bg-gray-200 text-gray-800 hover:bg-gray-300 gap-2"
                        onClick={handleRetryInit}
                      >
                        <RefreshCw className="h-4 w-4" />
                        Réessayer l'initialisation
                      </Button>
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
