import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

interface DeviceToken {
  device_token: string;
  platform: string;
  permission_granted: boolean;
}

class PushService {
  private teamId: string;
  private keyId: string;
  private privateKey: string;
  private bundleId: string;

  constructor(teamId: string, keyId: string, privateKey: string, bundleId: string) {
    this.teamId = teamId;
    this.keyId = keyId;
    this.privateKey = privateKey;
    this.bundleId = bundleId;
  }

  private async generateJWT(): Promise<string> {
    const header = {
      alg: 'ES256',
      kid: this.keyId
    };

    const payload = {
      iss: this.teamId,
      iat: Math.floor(Date.now() / 1000)
    };

    const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    
    const signingInput = `${headerB64}.${payloadB64}`;
    
    // Import the private key
    const keyData = this.privateKey.replace(/-----BEGIN PRIVATE KEY-----/g, '')
      .replace(/-----END PRIVATE KEY-----/g, '')
      .replace(/\s/g, '');
    
    const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
    
    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      binaryKey,
      {
        name: 'ECDSA',
        namedCurve: 'P-256'
      },
      false,
      ['sign']
    );

    // Sign the data
    const signature = await crypto.subtle.sign(
      {
        name: 'ECDSA',
        hash: 'SHA-256'
      },
      cryptoKey,
      new TextEncoder().encode(signingInput)
    );

    const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    return `${headerB64}.${payloadB64}.${signatureB64}`;
  }

  async sendPushNotifications(
    deviceTokens: DeviceToken[],
    payload: PushNotificationPayload
  ): Promise<void> {
    console.log(`Sending push notifications to ${deviceTokens.length} devices`);

    // Filter for iOS devices with permission granted
    const iosDevices = deviceTokens.filter(
      device => device.platform === 'ios' && device.permission_granted
    );

    if (iosDevices.length === 0) {
      console.log('No iOS devices with granted permissions found');
      return;
    }

    const jwt = await this.generateJWT();
    const apnsPayload = {
      aps: {
        alert: {
          title: payload.title,
          body: payload.body
        },
        badge: 1,
        sound: 'default'
      },
      ...payload.data
    };

    const promises = iosDevices.map(async (device) => {
      try {
        const response = await fetch(
          `https://api.push.apple.com/3/device/${device.device_token}`,
          {
            method: 'POST',
            headers: {
              'authorization': `bearer ${jwt}`,
              'apns-topic': this.bundleId,
              'apns-push-type': 'alert',
              'apns-priority': '10',
              'content-type': 'application/json'
            },
            body: JSON.stringify(apnsPayload)
          }
        );

        if (response.ok) {
          console.log(`Push notification sent successfully to device: ${device.device_token.substring(0, 10)}...`);
        } else {
          console.error(`Failed to send push notification to device: ${device.device_token.substring(0, 10)}...`, await response.text());
        }
      } catch (error) {
        console.error(`Error sending push notification to device: ${device.device_token.substring(0, 10)}...`, error);
      }
    });

    await Promise.all(promises);
    console.log('Push notification sending completed');
  }
}

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
    const pushService = new PushService(apnsTeamId, apnsKeyId, apnsPrivateKey, apnsBundleId);

    // Get device tokens from push_settings table
    console.log("Fetching device tokens...");
    const { data: deviceTokens, error } = await supabase
      .from('push_settings')
      .select('device_token, platform, permission_granted')
      .eq('permission_granted', true);

    if (error) {
      console.error("Error fetching device tokens:", error);
      throw error;
    }
    
    if (!deviceTokens || deviceTokens.length === 0) {
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
    
    try {
      const body = await req.json();
      if (body.title) customTitle = body.title;
      if (body.body) customBody = body.body;
    } catch (e) {
      console.log("No custom message provided, using defaults");
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