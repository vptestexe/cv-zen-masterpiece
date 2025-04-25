
import { useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useMerchantId = () => {
  const merchantIdRef = useRef<string | null>(null);

  const fetchMerchantId = async () => {
    if (merchantIdRef.current) {
      return merchantIdRef.current;
    }

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
    
    merchantIdRef.current = secretData.value;
    return merchantIdRef.current;
  };

  return { fetchMerchantId };
};
