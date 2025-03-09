
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.26.0';

// Constants
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY') || '';

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
    const { channelUrl, verificationCode, userId } = await req.json();
    
    if (!channelUrl || !verificationCode || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Extract channel ID from URL (this is a simplified version)
    let channelId = '';
    let channelType = '';
    
    if (channelUrl.includes('youtube.com/channel/')) {
      channelId = channelUrl.split('youtube.com/channel/')[1].split('?')[0];
      channelType = 'id';
    } else if (channelUrl.includes('youtube.com/c/')) {
      channelId = channelUrl.split('youtube.com/c/')[1].split('?')[0];
      channelType = 'custom';
    } else if (channelUrl.includes('youtube.com/@')) {
      channelId = channelUrl.split('youtube.com/@')[1].split('?')[0];
      channelType = 'handle';
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid YouTube channel URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // In a real implementation, we would:
    // 1. Fetch the channel description using the YouTube API
    // 2. Check if the verification code is in the description
    // 3. If verified, update the user's profile with the channel info
    
    // For demo purposes, we'll simulate a successful verification
    
    // Update user profile with YouTube channel info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update({
        youtube_channel_id: channelId,
        youtube_channel_url: channelUrl,
        youtube_channel_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (profileError) {
      console.error('Error updating profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to update profile', details: profileError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, profile }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in verify-youtube-channel function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
