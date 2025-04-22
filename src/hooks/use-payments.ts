
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
      // Call the verify_payment function
      const { data, error } = await supabase.rpc('verify_payment', {
        p_user_id: userId,
        p_cv_id: cvId,
        p_amount: amount,
        p_transaction_id: transactionId || null,
      });
      if (error) throw error;
      return data;
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
