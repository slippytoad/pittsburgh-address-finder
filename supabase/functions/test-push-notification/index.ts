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
  apns_environment?: string;
}

class PushService {
  private teamId: string;
  private keyId: string;
  private privateKey: string;
  private bundleId: string;
  private isProduction: boolean;

  constructor(teamId: string, keyId: string, privateKey: string, bundleId: string, isProduction: boolean = true) {
    this.teamId = teamId;
    this.keyId = keyId;
    this.privateKey = privateKey;
    this.bundleId = bundleId;
    this.isProduction = isProduction;
  }

  getApnsUrl(): string {
    return this.isProduction 
      ? 'https://api.push.apple.com/3/device/'
      : 'https://api.sandbox.push.apple.com/3/device/';
  }

  private async generateJWT(): Promise<string> {
    console.log('Generating JWT with Team ID:', this.teamId, 'Key ID:', this.keyId);
    
    const header = {
      alg: 'ES256',
      kid: this.keyId
    };

    const payload = {
      iss: this.teamId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiration
    };

    console.log('JWT payload:', payload);

    const headerB64 = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    const payloadB64 = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    
    const signingInput = `${headerB64}.${payloadB64}`;
    console.log('Signing input length:', signingInput.length);
    
    try {
      // Clean the private key - handle both formats
      let cleanKey = this.privateKey.trim();
      console.log('Private key starts with:', cleanKey.substring(0, 50));
      
      // Remove any existing headers and whitespace
      const keyContent = cleanKey
        .replace(/-----BEGIN PRIVATE KEY-----/g, '')
        .replace(/-----END PRIVATE KEY-----/g, '')
        .replace(/-----BEGIN EC PRIVATE KEY-----/g, '')
        .replace(/-----END EC PRIVATE KEY-----/g, '')
        .replace(/\s/g, '')
        .replace(/\n/g, '');
      
      console.log('Cleaned key content length:', keyContent.length);
      
      // Convert to binary
      const keyBuffer = Uint8Array.from(atob(keyContent), c => c.charCodeAt(0));
      console.log('Key buffer length:', keyBuffer.length);
      
      const cryptoKey = await crypto.subtle.importKey(
        'pkcs8',
        keyBuffer.buffer,
        {
          name: 'ECDSA',
          namedCurve: 'P-256'
        },
        false,
        ['sign']
      );

      console.log('Crypto key imported successfully');

      // Sign the JWT
      const signature = await crypto.subtle.sign(
        {
          name: 'ECDSA',
          hash: 'SHA-256'
        },
        cryptoKey,
        new TextEncoder().encode(signingInput)
      );

      console.log('Signature generated, length:', signature.byteLength);

      // Convert signature to base64url
      const signatureArray = new Uint8Array(signature);
      const signatureB64 = btoa(String.fromCharCode(...signatureArray))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const jwt = `${headerB64}.${payloadB64}.${signatureB64}`;
      console.log('Generated JWT length:', jwt.length);
      console.log('JWT header:', headerB64);
      console.log('JWT payload:', payloadB64);
      console.log('JWT signature length:', signatureB64.length);
      
      return jwt;
    } catch (error) {
      console.error('JWT generation error:', error);
      console.error('Error stack:', error.stack);
      throw new Error(`Failed to generate JWT: ${error.message}`);
    }
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

    const apnsPayload = {
      aps: {
        alert: {
          title: payload.title,
          body: payload.body
        },
        badge: 1,
        sound: 'default',
        'mutable-content': 1
      },
      'attachment-url': 'https://72f422ba-d056-495b-be0e-dffed3e7e0a4.lovableproject.com/src/assets/logo.png',
      ...payload.data
    };

    const promises = iosDevices.map(async (device) => {
      try {
        // Determine environment for this specific device
        const deviceIsProduction = device.apns_environment === 'production' || !device.apns_environment;
        const deviceApnsUrl = deviceIsProduction 
          ? 'https://api.push.apple.com/3/device/'
          : 'https://api.sandbox.push.apple.com/3/device/';
        
        console.log(`Device ${device.device_token.substring(0, 10)}... - Environment: ${deviceIsProduction ? 'production' : 'sandbox'}, URL: ${deviceApnsUrl}`);
        
        // Generate JWT for each device (in case we need different configurations later)
        const jwt = await this.generateJWT();
        
        const response = await fetch(
          `${deviceApnsUrl}${device.device_token}`,
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
          console.log(`Push notification sent successfully to device: ${device.device_token.substring(0, 10)}... (${deviceIsProduction ? 'production' : 'sandbox'})`);
        } else {
          console.error(`Failed to send push notification to device: ${device.device_token.substring(0, 10)}... (${deviceIsProduction ? 'production' : 'sandbox'})`, await response.text());
        }
      } catch (error) {
        console.error(`Error sending push notification to device: ${device.device_token.substring(0, 10)}... (${deviceIsProduction ? 'production' : 'sandbox'})`, error);
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
    
    // Parse request body for custom message

    // Get device tokens from push_settings table
    console.log("Fetching device tokens...");
    const { data: deviceTokens, error } = await supabase
      .from('push_settings')
      .select('device_token, platform, permission_granted, apns_environment')
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

    // Create push service (environment is determined per-device)
    const pushService = new PushService(apnsTeamId, apnsKeyId, apnsPrivateKey, apnsBundleId, true);
    
    console.log(`APNs endpoint: ${pushService.getApnsUrl()}`);
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