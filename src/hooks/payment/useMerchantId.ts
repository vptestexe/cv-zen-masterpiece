
import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PAIEMENT_PRO_CONFIG } from "@/config/payment";

export const useMerchantId = () => {
  const merchantIdRef = useRef<string | null>(null);
  const [merchantIdError, setMerchantIdError] = useState<string | null>(null);

  const fetchMerchantId = async () => {
    if (merchantIdRef.current) {
      return merchantIdRef.current;
    }

    setMerchantIdError(null);
    
    try {
      console.log("Récupération de l'ID marchand depuis Supabase");
      
      // Simuler un ID marchand en mode sandbox si activé
      if (PAIEMENT_PRO_CONFIG.SANDBOX_MODE && PAIEMENT_PRO_CONFIG.DEBUG) {
        console.log("Mode sandbox activé, utilisation d'un ID marchand de test");
        merchantIdRef.current = "SANDBOX_MERCHANT_123456";
        return merchantIdRef.current;
      }
      
      const { data: secretData, error: secretError } = await supabase.functions.invoke(
        "get-payment-config",
        {
          body: { secret_name: "PAIEMENTPRO_MERCHANT_ID" }
        }
      );
      
      if (secretError) {
        console.error("Erreur de récupération de l'ID marchand:", secretError);
        setMerchantIdError("Échec de communication avec Supabase Functions");
        throw new Error("Impossible de récupérer l'ID marchand. Service indisponible.");
      }
      
      if (!secretData?.value) {
        console.error("ID marchand non configuré dans Supabase");
        setMerchantIdError("ID marchand non configuré dans Supabase");
        throw new Error("ID marchand non configuré. Veuillez contacter l'administrateur.");
      }
      
      merchantIdRef.current = secretData.value;
      return merchantIdRef.current;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      setMerchantIdError(errorMessage);
      throw error;
    }
  };

  return { fetchMerchantId, merchantIdError };
};
