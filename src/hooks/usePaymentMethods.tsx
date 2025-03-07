
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export interface PaymentMethod {
  id: string;
  method_type: 'stripe' | 'paypal' | 'bank_transfer';
  is_default: boolean;
  details: {
    account?: string;
    email?: string;
    last4?: string;
    brand?: string;
    bank_name?: string;
    account_number?: string;
  };
  created_at: string;
}

export function usePaymentMethods() {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentMethods = async () => {
    if (!user) {
      setPaymentMethods([]);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });
        
      if (fetchError) throw fetchError;
      
      setPaymentMethods(data || []);
    } catch (err: any) {
      console.error('Error fetching payment methods:', err);
      setError(err.message || 'Failed to load payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  const addPaymentMethod = async (
    methodType: 'stripe' | 'paypal' | 'bank_transfer',
    details: any,
    makeDefault = false
  ) => {
    if (!user) {
      toast.error('You must be logged in to add a payment method');
      return null;
    }
    
    try {
      // If making default, update all existing methods to non-default
      if (makeDefault && paymentMethods.length > 0) {
        await supabase
          .from('payment_methods')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }
      
      // Insert new payment method
      const { data, error } = await supabase
        .from('payment_methods')
        .insert([
          {
            user_id: user.id,
            method_type: methodType,
            details,
            is_default: makeDefault || paymentMethods.length === 0 // Make default if first method
          }
        ])
        .select();
        
      if (error) throw error;
      
      // Refresh payment methods
      await fetchPaymentMethods();
      
      return data?.[0] || null;
    } catch (err: any) {
      console.error('Error adding payment method:', err);
      toast.error(err.message || 'Failed to add payment method');
      return null;
    }
  };

  const setDefaultPaymentMethod = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to update payment methods');
      return false;
    }
    
    try {
      // Set all payment methods to non-default
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id);
      
      // Set the selected one to default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Refresh payment methods
      await fetchPaymentMethods();
      
      return true;
    } catch (err: any) {
      console.error('Error setting default payment method:', err);
      toast.error(err.message || 'Failed to update payment method');
      return false;
    }
  };

  const removePaymentMethod = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to remove a payment method');
      return false;
    }
    
    try {
      // Check if this is the default method
      const methodToRemove = paymentMethods.find(method => method.id === id);
      
      // Delete the payment method
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // If removing default and other methods exist, set a new default
      if (methodToRemove?.is_default && paymentMethods.length > 1) {
        const newDefault = paymentMethods.find(method => method.id !== id);
        if (newDefault) {
          await supabase
            .from('payment_methods')
            .update({ is_default: true })
            .eq('id', newDefault.id);
        }
      }
      
      // Refresh payment methods
      await fetchPaymentMethods();
      
      return true;
    } catch (err: any) {
      console.error('Error removing payment method:', err);
      toast.error(err.message || 'Failed to remove payment method');
      return false;
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, [user]);

  return {
    paymentMethods,
    isLoading,
    error,
    fetchPaymentMethods,
    addPaymentMethod,
    setDefaultPaymentMethod,
    removePaymentMethod
  };
}
