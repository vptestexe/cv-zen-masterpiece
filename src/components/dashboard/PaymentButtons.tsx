
interface PaymentButtonsProps {
  infoMissing: boolean;
  isProcessing: boolean;
  onClose: () => void;
  onPayment: (e: React.MouseEvent) => void;
  onTestPayment: (e: React.MouseEvent) => void;
}

const PaymentButtons = ({
  infoMissing,
  isProcessing,
  onClose,
  onPayment,
  onTestPayment
}: PaymentButtonsProps) => {
  if (infoMissing) {
    return (
      <button
        onClick={onClose}
        className="py-2 px-4 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors font-medium"
        type="button"
      >
        Retourner au dashboard
      </button>
    );
  }

  return (
    <>
      <button
        onClick={onPayment}
        disabled={isProcessing || infoMissing}
        className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
        type="button"
      >
        {isProcessing ? "Traitement en cours..." : "Payer avec RayCash/PayLink"}
      </button>
      
      <button
        onClick={onTestPayment}
        disabled={isProcessing || infoMissing}
        className="mt-2 py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 text-sm"
        type="button"
      >
        Test: Simuler un paiement réussi
      </button>
    </>
  );
};

export default PaymentButtons;
