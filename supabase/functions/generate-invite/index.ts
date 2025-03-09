
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.26.0';

// Constants
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to generate random invite code
const generateRandomCode = (length = 8) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like I, O, 0, 1
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Fixed demo code for testing
const DEMO_CODE = "DEMO2024";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, expiryDays, isAdminGenerated, isDemo } = await req.json();
    
    // For demo code requests, we'll create or return the demo code
    if (isDemo) {
      console.log("Demo code requested");
      
      // Create Supabase client
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      
      // Check if demo code already exists
      const { data: existingCode, error: checkError } = await supabase
        .from('invite_codes')
        .select('*')
        .eq('code', DEMO_CODE)
        .maybeSingle();
        
      if (checkError) {
        throw checkError;
      }
      
      // If demo code doesn't exist, create it
      if (!existingCode) {
        console.log("Creating new demo code");
        const { data: newDemoCode, error: createError } = await supabase
          .from('invite_codes')
          .insert({
            code: DEMO_CODE,
            created_by: userId || null,
            expires_at: null, // Never expires
            is_admin_generated: true
          })
          .select()
          .single();
          
        if (createError) {
          throw createError;
        }
        
        return new Response(
          JSON.stringify({ 
            success: true,
            invite: newDemoCode,
            message: "Demo code created"
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // If code exists but is already used, reset it
      if (existingCode && existingCode.is_used) {
        console.log("Resetting used demo code");
        const { data: resetCode, error: resetError } = await supabase
          .from('invite_codes')
          .update({ 
            is_used: false,
            used_by: null 
          })
          .eq('code', DEMO_CODE)
          .select()
          .single();
          
        if (resetError) {
          throw resetError;
        }
        
        return new Response(
          JSON.stringify({ 
            success: true,
            invite: resetCode,
            message: "Demo code reset"
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Return the existing demo code
      return new Response(
        JSON.stringify({ 
          success: true,
          invite: existingCode,
          message: "Existing demo code returned"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Regular invite code generation (existing functionality)
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required userId parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Verify user exists and can generate invites
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('is_admin, invites_available')
      .eq('id', userId)
      .single();

    if (userError || !userProfile) {
      return new Response(
        JSON.stringify({ error: 'User not found', details: userError }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if non-admin user has invites available
    if (!userProfile.is_admin && (!userProfile.invites_available || userProfile.invites_available <= 0)) {
      return new Response(
        JSON.stringify({ error: 'No invites available' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate a unique invite code
    let isUnique = false;
    let inviteCode = '';
    
    while (!isUnique) {
      inviteCode = generateRandomCode();
      
      // Check if code already exists
      const { data, error } = await supabase
        .from('invite_codes')
        .select('code')
        .eq('code', inviteCode)
        .maybeSingle();
        
      if (error) {
        throw error;
      }
      
      isUnique = !data;
    }
    
    // Calculate expiry date if provided
    let expiresAt = null;
    if (expiryDays) {
      const date = new Date();
      date.setDate(date.getDate() + expiryDays);
      expiresAt = date.toISOString();
    }
    
    // Insert the new invite code
    const { data: invite, error: inviteError } = await supabase
      .from('invite_codes')
      .insert({
        code: inviteCode,
        created_by: userId,
        expires_at: expiresAt,
        is_admin_generated: isAdminGenerated || false
      })
      .select()
      .single();
      
    if (inviteError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create invite code', details: inviteError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // If not admin-generated, decrement the user's available invites
    if (!userProfile.is_admin && !isAdminGenerated) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          invites_available: userProfile.invites_available - 1
        })
        .eq('id', userId);
        
      if (updateError) {
        console.error('Failed to update user invites count:', updateError);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        invite
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-invite function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
