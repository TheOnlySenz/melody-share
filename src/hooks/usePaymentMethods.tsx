
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export interface PaymentMethod {
  id: string;
  user_id: string;
  method_type: 'stripe' | 'paypal' | 'bank_transfer';
  details: Json;
  is_default: boolean;
  created_at: string;
}

export function usePaymentMethods() {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchPaymentMethods = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Convert the method_type to the correct type
        const typedData: PaymentMethod[] = data?.map(method => ({
          ...method,
          method_type: method.method_type as 'stripe' | 'paypal' | 'bank_transfer'
        })) || [];
        
        setPaymentMethods(typedData);
      } catch (err: any) {
        console.error('Error fetching payment methods:', err);
        setError(err.message || 'Failed to load payment methods');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentMethods();
  }, [user]);

  const addPaymentMethod = async (
    method: 'stripe' | 'paypal' | 'bank_transfer', 
    details: any, 
    makeDefault = false
  ) => {
    if (!user) {
      toast.error('You must be logged in to add a payment method');
      return null;
    }
    
    try {
      // If making this the default, update all other methods to not be default
      if (makeDefault) {
        await supabase
          .from('payment_methods')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }
      
      // Add the new payment method
      const { data, error } = await supabase
        .from('payment_methods')
        .insert([
          {
            user_id: user.id,
            method_type: method,
            details,
            is_default: makeDefault
          }
        ])
        .select('*')
        .single();
      
      if (error) throw error;
      
      // Update the local state
      if (data) {
        setPaymentMethods(prev => [
          {
            ...data,
            method_type: data.method_type as 'stripe' | 'paypal' | 'bank_transfer'
          }, 
          ...prev.map(pm => 
            makeDefault ? { ...pm, is_default: false } : pm
          )
        ]);
        
        toast.success('Payment method added successfully');
        return data;
      }
      
      return null;
    } catch (err: any) {
      console.error('Error adding payment method:', err);
      toast.error(err.message || 'Failed to add payment method');
      return null;
    }
  };

  const updatePaymentMethod = async (
    id: string, 
    details: any, 
    makeDefault = false
  ) => {
    if (!user) {
      toast.error('You must be logged in to update a payment method');
      return;
    }
    
    try {
      // If making this the default, update all other methods to not be default
      if (makeDefault) {
        await supabase
          .from('payment_methods')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .neq('id', id);
      }
      
      // Update the payment method
      const { error } = await supabase
        .from('payment_methods')
        .update({
          details,
          is_default: makeDefault
        })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Update the local state
      setPaymentMethods(prev => prev.map(pm => {
        if (pm.id === id) {
          return { ...pm, details, is_default: makeDefault };
        }
        return makeDefault ? { ...pm, is_default: false } : pm;
      }));
      
      toast.success('Payment method updated successfully');
    } catch (err: any) {
      console.error('Error updating payment method:', err);
      toast.error(err.message || 'Failed to update payment method');
    }
  };

  const deletePaymentMethod = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete a payment method');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Update the local state
      setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
      
      toast.success('Payment method deleted successfully');
    } catch (err: any) {
      console.error('Error deleting payment method:', err);
      toast.error(err.message || 'Failed to delete payment method');
    }
  };

  return {
    paymentMethods,
    isLoading,
    error,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod
  };
}
