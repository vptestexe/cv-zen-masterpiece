import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { PaymentLoading } from "./payment/PaymentLoading";
import { PaymentError } from "./payment/PaymentError";
import { PaymentSuccess } from "./payment/PaymentSuccess";
import { PaymentForm } from "./payment/PaymentForm";
import { usePaymentDialog } from "@/hooks/usePaymentDialog";
import { PAID_DOWNLOADS_PER_CV, PAYMENT_AMOUNT } from "@/utils/downloads/types";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Check, CreditCard, Loader2, AlertTriangle, RefreshCw } from "lucide-react";

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
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const merchantIdRef = useRef<string | null>(null);

  // Nettoyer complètement l'état quand le dialogue se ferme
  useEffect(() => {
    if (!open) {
      setIsInitialized(false);
      setIsInitializing(false);
      setInitError(null);
      setInitRetries(0);
      merchantIdRef.current = null;
    }
  }, [open]);

  // Force re-initialization when dialog is re-opened
  useEffect(() => {
    if (open) {
      console.log("Dialog ouvert, réinitialisation de l'état");
      setIsInitialized(false);
      setIsInitializing(false);
      setInitError(null);
      setInitRetries(0);
      
      // Chargez le script de manière dynamique lorsque le dialogue s'ouvre
      const loadScript = () => {
        console.log("Chargement dynamique du script PaiementPro");
        
        // Supprimez l'ancien script s'il existe
        const oldScript = document.querySelector('script[src*="paiementpro.min.js"]');
        if (oldScript) {
          console.log("Suppression de l'ancien script PaiementPro");
          oldScript.remove();
        }
        
        // Créez un nouveau script
        const script = document.createElement('script');
        script.src = "https://js.paiementpro.net/v1/paiementpro.min.js";
        script.defer = true;
        script.async = true;
        
        // Ajoutez des écouteurs d'événements pour détecter le chargement ou les erreurs
        script.onload = () => {
          console.log("Script PaiementPro chargé avec succès");
          // Donnez un court délai pour que le SDK s'initialise complètement
          setTimeout(() => {
            if (window.PaiementPro) {
              console.log("SDK PaiementPro détecté dans window");
              // Lancez l'initialisation du SDK après confirmation du chargement
              initializePaiementPro();
            } else {
              console.error("Script chargé mais SDK PaiementPro non détecté dans window");
              setInitError("Le SDK PaiementPro n'a pas pu être chargé correctement");
            }
          }, 500);
        };
        
        script.onerror = () => {
          console.error("Erreur lors du chargement du script PaiementPro");
          setInitError("Impossible de charger le script PaiementPro");
        };
        
        // Ajoutez le script au document
        document.body.appendChild(script);
        scriptRef.current = script;
      };
      
      // Déclenchez le chargement avec un délai pour s'assurer que le dialogue est bien monté
      const timer = setTimeout(() => {
        loadScript();
      }, 300);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [open]);
  
  // Fonction d'initialisation séparée pour plus de clarté
  const initializePaiementPro = async () => {
    if (isInitializing) return;
    
    setIsInitializing(true);
    setInitError(null);
    
    console.log("Tentative d'initialisation PaiementPro...", { retries: initRetries });
    
    try {
      // Vérifiez que le SDK est disponible
      if (!window.PaiementPro) {
        throw new Error("SDK PaiementPro non chargé");
      }

      // Si nous avons déjà récupéré l'ID marchand, utilisons-le directement
      let merchantId = merchantIdRef.current;
      
      // Sinon, récupérons-le depuis Supabase
      if (!merchantId) {
        console.log("Récupération de l'ID marchand depuis Supabase");
        const { data: secretData, error: secretError } = await supabase.functions.invoke(
          "get-payment-config",
          {
            body: { secret_name: "PAIEMENTPRO_MERCHANT_ID" }
          }
        );
        
        if (secretError || !secretData?.value) {
          console.error("Erreur de récupération de l'ID marchand:", secretError);
          throw new Error("ID marchand non configuré. Veuillez vérifier vos paramètres.");
        }
        
        merchantId = secretData.value;
        merchantIdRef.current = merchantId; // Stockez pour les futures initialisations
      }

      console.log("Initialisation PaiementPro avec ID marchand...");
      
      // Configuration du SDK avec les paramètres harmonisés
      window.PaiementPro.init({
        merchantId: merchantId,
        amount: PAYMENT_AMOUNT,
        description: "Téléchargement CV",
        callbackUrl: window.location.origin + "/dashboard",
      });

      // Vérifiez que l'initialisation a réussi en accédant à une méthode du SDK
      if (typeof window.PaiementPro.startPayment !== 'function') {
        throw new Error("Initialisation incomplète du SDK");
      }

      setIsInitialized(true);
      setIsInitializing(false);
      console.log("PaiementPro initialisé avec succès");
    } catch (error) {
      console.error("Erreur d'initialisation PaiementPro:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      setInitError(errorMessage);
      
      // Gestion des retries avec délais croissants
      if (initRetries < MAX_RETRIES) {
        const nextRetry = initRetries + 1;
        setInitRetries(nextRetry);
        
        // Délai progressif entre les tentatives (3000ms, 6000ms, 9000ms)
        const retryDelay = 3000 * (nextRetry);
        console.log(`Réessai d'initialisation (${nextRetry}/${MAX_RETRIES}) dans ${retryDelay/1000}s...`);
        
        setTimeout(() => {
          setIsInitializing(false);
          // Rechargez complètement le script avant de réessayer
          const oldScript = document.querySelector('script[src*="paiementpro.min.js"]');
          if (oldScript) {
            oldScript.remove();
          }
          
          const script = document.createElement('script');
          script.src = "https://js.paiementpro.net/v1/paiementpro.min.js";
          script.defer = true;
          script.async = true;
          document.body.appendChild(script);
          scriptRef.current = script;
          
          // Délai supplémentaire avant la nouvelle tentative
          setTimeout(initializePaiementPro, 1000);
        }, retryDelay);
      } else {
        toast({
          title: "Erreur de configuration",
          description: "Impossible d'initialiser le système de paiement. Veuillez réessayer plus tard.",
          variant: "destructive"
        });
        setIsInitializing(false);
      }
    }
  };

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
    console.log("Tentative de réinitialisation manuelle");
    setIsInitialized(false);
    setIsInitializing(false);
    setInitError(null);
    setInitRetries(0);
    
    // Force le rechargement complet du script
    const oldScript = document.querySelector('script[src*="paiementpro.min.js"]');
    if (oldScript) {
      oldScript.remove();
    }
    
    const script = document.createElement('script');
    script.src = "https://js.paiementpro.net/v1/paiementpro.min.js";
    script.defer = true;
    script.async = true;
    
    script.onload = () => {
      console.log("Script rechargé avec succès, initialisation dans 1s");
      setTimeout(initializePaiementPro, 1000);
    };
    
    document.body.appendChild(script);
    scriptRef.current = script;
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
            ) : (
              <>
                {isInitializing ? (
                  <PaymentLoading />
                ) : initError ? (
                  <PaymentError error={initError} onRetry={handleRetryInit} />
                ) : (
                  <PaymentForm 
                    onPayment={handlePayment}
                    isInitialized={isInitialized}
                    isProcessing={verificationStatus === 'processing'}
                  />
                )}
              </>
            )}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
