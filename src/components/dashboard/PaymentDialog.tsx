
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PAYMENT_AMOUNT } from "@/utils/downloadManager";
import { useIsMobile } from "@/hooks/use-mobile";

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
}

const PaymentDialog = ({ open, onClose }: PaymentDialogProps) => {
  const isMobile = useIsMobile();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Paiement Wave requis</DialogTitle>
          <DialogDescription>
            Pour télécharger ce CV, veuillez payer <span className="font-bold">{PAYMENT_AMOUNT} CFA</span> pour obtenir 5 téléchargements.
            Suivez les instructions ci-dessous. 
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          {isMobile ? (
            <>
              <p className="text-sm text-muted-foreground">
                Veuillez payer Cvbuilder avec Wave en cliquant sur ce lien&nbsp;:
              </p>
              <a
                href="https://pay.wave.com/m/M_ci_C5jSUwlXR3P5/c/ci/?amount=100"
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
                  1000 CFA
                </span>
                <a
                  href="https://pay.wave.com/m/M_ci_C5jSUwlXR3P5/c/ci/?amount=100"
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
