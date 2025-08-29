import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PushSettingsRequest {
  device_token: string;
  platform: string;
  permission_granted?: boolean;
  app_version?: string;
  device_model?: string;
  os_version?: string;
  apns_environment?: string;
}

Deno.serve(async (req) => {
  console.log(`📱 Incoming ${req.method} request to register-push-settings from ${req.headers.get('user-agent') || 'unknown'}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight request handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    console.log(`🔐 Authorization header present: ${!!authHeader}`);
    if (!authHeader) {
      console.log('❌ Missing Authorization header - returning 401');
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log(`❌ Auth validation failed - Error: ${authError?.message || 'No user'} - returning 401`);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log(`✅ User authenticated successfully: ${user.id}`);

    // Parse request body
    const body: PushSettingsRequest = await req.json();

    // Validate required fields
    console.log(`📝 Request body - platform: ${body.platform}, device_token: ${body.device_token ? 'present' : 'missing'}`);
    if (!body.device_token || !body.platform) {
      console.log('❌ Missing required fields - returning 400');
      return new Response(
        JSON.stringify({ error: 'device_token and platform are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare data for upsert
    const pushSettingsData = {
      user_id: user.id,
      device_token: body.device_token,
      platform: body.platform,
      permission_granted: body.permission_granted ?? true,
      app_version: body.app_version,
      device_model: body.device_model,
      os_version: body.os_version,
      apns_environment: body.apns_environment,
      updated_at: new Date().toISOString(),
    };

    // Upsert push settings (update if exists, insert if not)
    const { data, error } = await supabase
      .from('push_settings')
      .upsert(pushSettingsData, {
        onConflict: 'user_id,device_token',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Database error upserting push settings:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to register push settings' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`✅ Push settings registered successfully for user ${user.id}, device: ${body.device_token.substring(0, 10)}...`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Push settings registered successfully',
        data 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in register-push-settings function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});