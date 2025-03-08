
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.26.0';

// Constants
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

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
    const formData = await req.formData();
    const userId = formData.get('userId') as string;
    const title = formData.get('title') as string;
    const genre = formData.get('genre') as string;
    const audioFile = formData.get('audioFile') as File;
    const coverImage = formData.get('coverImage') as File;
    const licenseTerms = JSON.parse(formData.get('licenseTerms') as string);
    const royaltySplit = JSON.parse(formData.get('royaltySplit') as string);

    if (!userId || !title || !audioFile) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for storage operations
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify user exists and has correct role
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError || !userProfile) {
      return new Response(
        JSON.stringify({ error: 'User not found', details: userError }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (userProfile.role !== 'artist' && userProfile.role !== 'admin' && !userProfile.has_dual_role) {
      return new Response(
        JSON.stringify({ error: 'User does not have permission to upload songs' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique filenames
    const audioFileName = `${userId}/${Date.now()}-${audioFile.name.replace(/\s+/g, '-')}`;
    const audioPath = `songs/${audioFileName}`;
    
    let coverPath = null;
    
    // Upload audio file
    const { data: audioData, error: audioError } = await supabase.storage
      .from('music')
      .upload(audioPath, audioFile, {
        contentType: audioFile.type,
        cacheControl: '3600',
      });

    if (audioError) {
      return new Response(
        JSON.stringify({ error: 'Failed to upload audio file', details: audioError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upload cover image if provided
    if (coverImage) {
      const coverFileName = `${userId}/${Date.now()}-${coverImage.name.replace(/\s+/g, '-')}`;
      coverPath = `covers/${coverFileName}`;
      
      const { error: coverError } = await supabase.storage
        .from('music')
        .upload(coverPath, coverImage, {
          contentType: coverImage.type,
          cacheControl: '3600',
        });

      if (coverError) {
        console.error('Failed to upload cover image:', coverError);
        // Non-critical error, continue without cover image
        coverPath = null;
      }
    }

    // Create song record in the database
    const { data: song, error: songError } = await supabase
      .from('songs')
      .insert({
        title,
        artist_id: userId,
        genre,
        file_path: audioPath,
        cover_image_path: coverPath,
        license_terms: licenseTerms,
        royalty_split: royaltySplit,
        status: 'pending'
      })
      .select()
      .single();

    if (songError) {
      // Clean up uploaded files if database insert fails
      await supabase.storage.from('music').remove([audioPath]);
      if (coverPath) {
        await supabase.storage.from('music').remove([coverPath]);
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to create song record', details: songError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        song,
        audioUrl: audioData.path,
        coverUrl: coverPath
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in song-upload function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
