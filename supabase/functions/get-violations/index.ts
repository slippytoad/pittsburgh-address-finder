import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  console.log(`📊 Incoming ${req.method} request to get-violations from ${req.headers.get('user-agent') || 'unknown'}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight request handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for anonymous access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('✅ Anonymous access enabled for violations fetch');

    // Fetch all violations from the database
    const { data: violations, error } = await supabase
      .from('violations')
      .select('*')
      .order('_id', { ascending: false });

    if (error) {
      console.error('❌ Database error fetching violations:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch violations' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`✅ Successfully fetched ${violations?.length || 0} violations`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: violations,
        count: violations?.length || 0
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in get-violations function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});