
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.26.0';
import { Stripe } from 'https://esm.sh/stripe@12.6.0';

// Constants
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { userId, amount, paymentMethodId } = await req.json();
    
    if (!userId || !amount || !paymentMethodId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the payment method details from our database
    const { data: paymentMethod, error: paymentMethodError } = await supabase
      .from('payment_methods')
      .select('details')
      .eq('id', paymentMethodId)
      .eq('user_id', userId)
      .maybeSingle();

    if (paymentMethodError || !paymentMethod) {
      return new Response(
        JSON.stringify({ error: 'Payment method not found', details: paymentMethodError }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch minimum payout threshold from platform settings
    const { data: settings, error: settingsError } = await supabase
      .from('platform_settings')
      .select('setting_value')
      .eq('setting_name', 'payout_thresholds')
      .single();
    
    if (settingsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch platform settings', details: settingsError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const minimumPayout = settings.setting_value.minimum_payout || 50;
    
    // Check if amount meets minimum threshold
    if (amount < minimumPayout) {
      return new Response(
        JSON.stringify({ 
          error: `Payout amount does not meet minimum threshold of $${minimumPayout}` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Creating a payment record in the database first
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount,
        payment_method: paymentMethodId,
        payment_details: {
          type: 'payout',
          status: 'processing'
        },
        status: 'processing'
      })
      .select()
      .single();

    if (transactionError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create transaction record', details: transactionError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Example code for processing the payout via Stripe
    // This would be replaced with the actual Stripe API call in a production environment
    const payoutResult = {
      success: true,
      transactionId: transaction.id,
      processedDate: new Date().toISOString(),
      status: 'completed'
    };

    // Update the transaction record with the completed status
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        status: 'completed',
        completed_date: new Date().toISOString(),
        payment_details: {
          ...transaction.payment_details,
          status: 'completed',
          stripe_payout_id: 'po_' + Math.random().toString(36).substring(2, 15)
        }
      })
      .eq('id', transaction.id);

    if (updateError) {
      console.error('Failed to update transaction record:', updateError);
    }

    // Update royalties status for this user
    const { error: royaltiesError } = await supabase
      .from('royalties')
      .update({ 
        status: 'paid',
        payment_id: transaction.id
      })
      .eq('status', 'approved')
      .or(`artist_id.eq.${userId},creator_id.eq.${userId}`);

    if (royaltiesError) {
      console.error('Failed to update royalties status:', royaltiesError);
    }

    return new Response(
      JSON.stringify(payoutResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in process-payout function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
