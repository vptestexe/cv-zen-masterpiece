
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PAYMENT_AMOUNT } from "@/utils/downloadManager";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useInsertPayment } from "@/hooks/use-payments";
import { Loader2 } from "lucide-react";

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
}

const PaymentDialog = ({ open, onClose }: PaymentDialogProps) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { mutate: insertPayment } = useInsertPayment();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [verificationMessage, setVerificationMessage] = useState("");
  
  const waveLink = import.meta.env.PROD 
    ? "https://pay.wave.com/m/M_ci_C5jSUwlXR3P5/c/ci/?amount=100"  // 1000 FCFA
    : "https://pay.wave.com/m/M_ci_C5jSUwlXR3P5/c/ci/?amount=5";   // 50 FCFA

  // Fonction de vérification de paiement
  const verifyPayment = async () => {
    const cvId = localStorage.getItem('cv_being_paid');
    const userId = localStorage.getItem('current_user_id');
    
    if (!cvId || !userId) {
      setVerificationMessage("Informations de paiement incomplètes");
      return false;
    }
    
    try {
      await insertPayment({
        userId,
        cvId,
        amount: PAYMENT_AMOUNT,
      });
      
      // Paiement validé
      localStorage.removeItem('cv_being_paid');
      setVerificationMessage("Paiement validé !");
      
      toast({
        title: "Paiement validé !",
        description: "Votre CV va être téléchargé automatiquement.",
      });
      
      // Rechargement de la page pour mettre à jour les compteurs
      setTimeout(() => window.location.reload(), 1500);
      return true;
    } catch (error) {
      console.log(`Tentative ${verificationAttempts + 1}: Vérification en cours...`);
      setVerificationMessage(`Vérification en cours (${verificationAttempts + 1})...`);
      return false;
    }
  };

  useEffect(() => {
    let verificationInterval: number | undefined;

    if (open && !isVerifying) {
      setIsVerifying(true);
      setVerificationMessage("Démarrage de la vérification...");
      
      // Vérification immédiate à l'ouverture
      verifyPayment();
      
      // Puis vérification périodique
      verificationInterval = window.setInterval(async () => {
        setVerificationAttempts(prev => prev + 1);
        const success = await verifyPayment();
        
        if (success) {
          clearInterval(verificationInterval);
          setIsVerifying(false);
          onClose();
        } else if (verificationAttempts > 20) {  // Environ 1 minute 40 secondes
          setVerificationMessage("Vérification prolongée. Paiement toujours en attente...");
        }
      }, 5000); // Vérifier toutes les 5 secondes
    }

    return () => {
      if (verificationInterval) {
        clearInterval(verificationInterval);
      }
      setIsVerifying(false);
      setVerificationAttempts(0);
    };
  }, [open, verificationAttempts]);

  const handleManualVerification = () => {
    toast({
      title: "Vérification manuelle",
      description: "Tentative de vérification du paiement...",
    });
    verifyPayment();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Paiement Wave requis</DialogTitle>
          <DialogDescription>
            Pour télécharger ce CV, veuillez payer <span className="font-bold">{PAYMENT_AMOUNT} CFA</span> pour obtenir 5 téléchargements.
            {isVerifying && (
              <div className="mt-2 flex items-center gap-2 text-amber-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                {verificationMessage}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          {isMobile ? (
            <>
              <p className="text-sm text-muted-foreground">
                Veuillez payer Cvbuilder avec Wave en cliquant sur ce lien&nbsp;:
              </p>
              <a
                href={waveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline font-semibold text-lg"
              >
                Payer avec Wave
              </a>
              <p className="text-xs text-gray-500 mt-2">
                Après paiement, revenez sur le site et cliquez à nouveau sur le bouton pour vérifier et débloquer votre téléchargement.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-2">
                Depuis un PC ou une tablette, scannez ce QR code avec votre application Wave pour payer.
              </p>
              <div className="flex justify-center mb-2">
                <img 
                  src="/lovable-uploads/6d5928c8-e6d7-4966-8802-42ff454becaa.png" 
                  alt="QR code Wave pour paiement CVbuilder" 
                  className="w-48 h-64 object-contain rounded-md border shadow"
                />
              </div>
              <div className="flex flex-col items-center mt-2">
                <span className="font-semibold text-lg text-primary">
                  {PAYMENT_AMOUNT} CFA
                </span>
                <a
                  href={waveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline mt-2 text-sm"
                >
                  Ou cliquez ici pour payer en ligne
                </a>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Après paiement, revenez sur le site et cliquez à nouveau sur le bouton pour vérifier et débloquer votre téléchargement.
              </p>
            </>
          )}
          
          {verificationAttempts > 2 && (
            <button 
              onClick={handleManualVerification}
              className="mt-4 py-2 px-4 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors font-medium"
            >
              Vérifier mon paiement maintenant
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
