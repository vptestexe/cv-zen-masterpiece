
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PAID_DOWNLOADS_PER_CV, PAYMENT_AMOUNT } from '@/utils/downloads/types';

export const useInsertPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, cvId, transactionId }: {
      userId: string,
      cvId: string,
      transactionId?: string,
    }) => {
      console.log("Tentative de vérification paiement pour:", { userId, cvId, amount: PAYMENT_AMOUNT });
      
      // Première tentative: vérification par rpc
      const { data, error } = await supabase.rpc('verify_payment', {
        p_user_id: userId,
        p_cv_id: cvId,
        p_amount: PAYMENT_AMOUNT,
        p_transaction_id: transactionId || null,
      });

      if (error) {
        console.error("Erreur vérification paiement:", error);
        throw error;
      }

      // Si la vérification réussit, on retourne les données
      if (data) {
        console.log("Paiement validé via RPC:", data);
        return data;
      }
      
      // Plan B: Vérifier directement dans la table des paiements
      const { data: existingPayments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .eq('cv_id', cvId)
        .eq('amount', PAYMENT_AMOUNT)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (paymentsError) {
        console.error("Erreur recherche paiements:", paymentsError);
      } else if (existingPayments && existingPayments.length > 0) {
        console.log("Paiement trouvé dans la base:", existingPayments[0]);
        return existingPayments[0];
      }
      
      throw new Error("Paiement non validé");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    }
  });
};

export const usePayments = (userId?: string) =>
  useQuery({
    queryKey: ['payments', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
