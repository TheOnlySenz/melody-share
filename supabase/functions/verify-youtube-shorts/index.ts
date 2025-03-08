
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
    const { videoId, songId, userId } = await req.json();
    
    if (!videoId || !songId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Fetch video data from YouTube API
    const youtubeResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`
    );

    if (!youtubeResponse.ok) {
      const errorData = await youtubeResponse.json();
      console.error('YouTube API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch video data from YouTube', details: errorData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const youtubeData = await youtubeResponse.json();
    
    // Check if video exists and is a Short (duration < 60 seconds)
    if (!youtubeData.items || youtubeData.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Video not found on YouTube' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const videoItem = youtubeData.items[0];
    const videoTitle = videoItem.snippet.title;
    const viewCount = parseInt(videoItem.statistics.viewCount, 10) || 0;

    // Check if usage record already exists
    const { data: existingUsage, error: usageError } = await supabase
      .from('song_usages')
      .select('id, views_count')
      .eq('video_id', videoId)
      .eq('song_id', songId)
      .maybeSingle();

    if (usageError) {
      console.error('Error checking existing usage:', usageError);
      return new Response(
        JSON.stringify({ error: 'Database error', details: usageError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;
    
    if (existingUsage) {
      // Update existing usage with new view count
      const { data, error } = await supabase
        .from('song_usages')
        .update({ 
          views_count: viewCount,
          video_title: videoTitle,
          verified: true,
          last_updated: new Date().toISOString()
        })
        .eq('id', existingUsage.id)
        .select()
        .single();
      
      if (error) throw error;
      result = { updated: true, data, previousViews: existingUsage.views_count };
    } else {
      // Create new usage record
      const { data, error } = await supabase
        .from('song_usages')
        .insert({
          song_id: songId,
          creator_id: userId,
          video_id: videoId,
          video_title: videoTitle,
          views_count: viewCount,
          verified: true
        })
        .select()
        .single();
      
      if (error) throw error;
      result = { created: true, data };
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in verify-youtube-shorts function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
