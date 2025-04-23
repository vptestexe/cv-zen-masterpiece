
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useInsertPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, cvId, amount, transactionId }: {
      userId: string,
      cvId: string,
      amount: number,
      transactionId?: string,
    }) => {
      const { data, error } = await supabase.rpc('verify_payment', {
        p_user_id: userId,
        p_cv_id: cvId,
        p_amount: amount,
        p_transaction_id: transactionId || null,
      });

      if (error) {
        console.error("Erreur vérification paiement:", error);
        throw error;
      }

      // Si la vérification réussit, on retourne les données
      if (data) {
        return data;
      } else {
        throw new Error("Paiement non validé");
      }
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
