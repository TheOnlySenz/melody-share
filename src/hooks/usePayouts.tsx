
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export function usePayouts() {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const processPayoutRequest = async (amount: number, paymentMethodId: string) => {
    if (!user) {
      toast.error('You must be logged in to request a payout');
      return null;
    }

    if (amount <= 0) {
      toast.error('Payout amount must be greater than zero');
      return null;
    }

    try {
      setIsProcessing(true);
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('process-payout', {
        body: { 
          userId: user.id,
          amount,
          paymentMethodId
        }
      });
      
      if (error) throw error;
      
      if (data.error) {
        toast.error(data.error);
        return null;
      }
      
      toast.success('Payout request submitted successfully');
      return data;
    } catch (err: any) {
      console.error('Error processing payout:', err);
      toast.error(err.message || 'Failed to process payout request');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    processPayoutRequest
  };
}
