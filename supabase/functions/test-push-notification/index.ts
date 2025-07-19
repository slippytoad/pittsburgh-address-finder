import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PushService } from "../daily-violation-check/push-service.ts";
import { DatabaseService } from "../daily-violation-check/database-service.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// APNs configuration
const apnsTeamId = Deno.env.get("APNS_TEAM_ID");
const apnsKeyId = Deno.env.get("APNS_KEY_ID");
const apnsPrivateKey = Deno.env.get("APNS_PRIVATE_KEY");
const apnsBundleId = Deno.env.get("APNS_BUNDLE_ID");

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting push notification test...");

    // Check if APNs is configured
    if (!apnsTeamId || !apnsKeyId || !apnsPrivateKey || !apnsBundleId) {
      console.log("APNs not configured - missing environment variables");
      return new Response(
        JSON.stringify({ 
          error: "APNs not configured",
          missing: {
            teamId: !apnsTeamId,
            keyId: !apnsKeyId,
            privateKey: !apnsPrivateKey,
            bundleId: !apnsBundleId
          }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Initialize services
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const dbService = new DatabaseService(supabase);
    const pushService = new PushService(apnsTeamId, apnsKeyId, apnsPrivateKey, apnsBundleId);

    // Get device tokens
    console.log("Fetching device tokens...");
    const deviceTokens = await dbService.getDeviceTokens();
    
    if (deviceTokens.length === 0) {
      console.log("No device tokens found");
      return new Response(
        JSON.stringify({ 
          message: "No device tokens found in push_settings table",
          deviceCount: 0
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${deviceTokens.length} device tokens`);

    // Parse request body for custom message
    let customTitle = "Test Notification";
    let customBody = "This is a test push notification from your app";
    
    if (req.body) {
      try {
        const body = await req.json();
        if (body.title) customTitle = body.title;
        if (body.body) customBody = body.body;
      } catch (e) {
        console.log("No custom message provided, using defaults");
      }
    }

    // Create test payload
    const testPayload = {
      title: customTitle,
      body: customBody,
      data: {
        test: true,
        timestamp: new Date().toISOString(),
        type: 'test_notification'
      }
    };

    // Send push notifications
    console.log("Sending test push notifications...");
    await pushService.sendPushNotifications(deviceTokens, testPayload);

    return new Response(
      JSON.stringify({ 
        message: "Test push notifications sent successfully",
        deviceCount: deviceTokens.length,
        payload: testPayload
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in test-push-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});