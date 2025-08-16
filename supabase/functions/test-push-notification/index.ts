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

interface ViolationRecord {
  _id: number;
  casefile_number?: string;
  address?: string;
  parcel_id?: string;
  status?: string;
  investigation_date?: string;
  violation_description?: string;
  violation_code_section?: string;
  violation_spec_instructions?: string;
  investigation_outcome?: string;
  investigation_findings?: string;
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
    const header = {
      alg: 'ES256',
      kid: this.keyId
    };

    const payload = {
      iss: this.teamId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiration
    };

    const headerB64 = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    const payloadB64 = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    
    const signingInput = `${headerB64}.${payloadB64}`;
    
    try {
      // Clean the private key - handle both formats
      let cleanKey = this.privateKey.trim();
      
      // Remove any existing headers and whitespace
      const keyContent = cleanKey
        .replace(/-----BEGIN PRIVATE KEY-----/g, '')
        .replace(/-----END PRIVATE KEY-----/g, '')
        .replace(/-----BEGIN EC PRIVATE KEY-----/g, '')
        .replace(/-----END EC PRIVATE KEY-----/g, '')
        .replace(/\s/g, '')
        .replace(/\n/g, '');
      
      // Convert to binary
      const keyBuffer = Uint8Array.from(atob(keyContent), c => c.charCodeAt(0));
      
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

      // Sign the JWT
      const signature = await crypto.subtle.sign(
        {
          name: 'ECDSA',
          hash: 'SHA-256'
        },
        cryptoKey,
        new TextEncoder().encode(signingInput)
      );

      // Convert signature to base64url
      const signatureArray = new Uint8Array(signature);
      const signatureB64 = btoa(String.fromCharCode(...signatureArray))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const jwt = `${headerB64}.${payloadB64}.${signatureB64}`;
      
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
  ): Promise<{success: boolean, errors: string[]}> {
    console.log(`Sending push notifications to ${deviceTokens.length} devices`);

    // Filter for iOS devices with permission granted
    const iosDevices = deviceTokens.filter(
      device => device.platform === 'ios' && device.permission_granted
    );

    if (iosDevices.length === 0) {
      console.log('No iOS devices with granted permissions found');
      return { success: false, errors: ['No iOS devices with granted permissions found'] };
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

    const errors: string[] = [];
    const promises = iosDevices.map(async (device, index) => {
      const deviceCount = `${index + 1}/${iosDevices.length}`;
      try {
        // Determine environment for this specific device
        const deviceIsProduction = device.apns_environment === 'production' || !device.apns_environment;
        const deviceApnsUrl = deviceIsProduction 
          ? 'https://api.push.apple.com/3/device/'
          : 'https://api.sandbox.push.apple.com/3/device/';
        
        console.log(`${deviceCount} Device ${device.device_token.substring(0, 10)}... - Environment: ${deviceIsProduction ? 'production' : 'sandbox'}, URL: ${deviceApnsUrl}`);
        
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
          console.log(`${deviceCount} Push notification sent successfully to device: ${device.device_token.substring(0, 10)}... (${deviceIsProduction ? 'production' : 'sandbox'})`);
        } else {
          const errorText = await response.text();
          const errorMessage = `${deviceCount} Failed to send push notification to device: ${device.device_token.substring(0, 10)}... (${deviceIsProduction ? 'production' : 'sandbox'}) - Status: ${response.status}, Error: ${errorText}`;
          console.error(errorMessage);
          errors.push(errorMessage);
        }
      } catch (error) {
        const errorMessage = `${deviceCount} Error sending push notification to device: ${device.device_token.substring(0, 10)}... (${deviceIsProduction ? 'production' : 'sandbox'}) - ${error.message}`;
        console.error(errorMessage);
        errors.push(errorMessage);
      }
    });

    await Promise.all(promises);
    console.log('Push notification sending completed');
    
    return { success: errors.length === 0, errors };
  }

  private static extractStreetAddress(fullAddress?: string): string {
    if (!fullAddress) return 'Unknown Address';
    
    // Split by comma and take the first part (street address)
    const streetAddress = fullAddress.split(',')[0].trim();
    return streetAddress || 'Unknown Address';
  }

  static createPushPayload(
    newCasefiles: ViolationRecord[], 
    newRecordsForExistingCases: ViolationRecord[]
  ): PushNotificationPayload {
    const totalNewRecords = newCasefiles.length + newRecordsForExistingCases.length;
    let title = 'New Violations Found';
    let body = '';
    
    // Handle new casefiles (completely new violations)
    if (newCasefiles.length > 0 && newRecordsForExistingCases.length === 0) {
      // Only new violations
      if (newCasefiles.length === 1) {
        const address = this.extractStreetAddress(newCasefiles[0].address);
        title = 'New Violation Found';
        body = `New violation found at ${address}`;
      } else {
        const firstAddress = this.extractStreetAddress(newCasefiles[0].address);
        body = `${newCasefiles.length} new violations found including ${firstAddress}`;
      }
    }
    // Handle updates to existing cases
    else if (newRecordsForExistingCases.length > 0 && newCasefiles.length === 0) {
      // Only updates to existing cases
      if (newRecordsForExistingCases.length === 1) {
        const address = this.extractStreetAddress(newRecordsForExistingCases[0].address);
        title = 'Violation Update';
        body = `Update to violation at ${address}`;
      } else {
        const firstAddress = this.extractStreetAddress(newRecordsForExistingCases[0].address);
        title = 'Violation Updates';
        body = `Updates to violations including ${firstAddress}`;
      }
    }
    // Handle mixed scenario (both new and updates)
    else if (newCasefiles.length > 0 && newRecordsForExistingCases.length > 0) {
      const firstAddress = this.extractStreetAddress(newCasefiles[0].address) || this.extractStreetAddress(newRecordsForExistingCases[0].address);
      body = `${totalNewRecords} violation updates including ${firstAddress}`;
    }
    // Fallback (should not happen, but just in case)
    else {
      body = `${totalNewRecords} new violation records found`;
    }

    // Get all addresses for custom data
    const allAddresses = [
      ...newCasefiles.map(r => r.address).filter(Boolean),
      ...newRecordsForExistingCases.map(r => r.address).filter(Boolean)
    ];

    return {
      title,
      body,
      data: {
        newCasefilesCount: newCasefiles.length,
        newRecordsForExistingCasesCount: newRecordsForExistingCases.length,
        totalNewRecords,
        addresses: allAddresses,
        type: 'violation_update'
      }
    };
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
    
    // Parse request body for device token (required) and optional environment
    let customDeviceToken: string | null = null;
    let environment: string = 'production'; // Default to production
    try {
      const body = await req.json();
      customDeviceToken = body?.device_token || null;
      environment = body?.environment || 'production';
      
      // Validate environment parameter
      if (environment !== 'production' && environment !== 'sandbox') {
        return new Response(
          JSON.stringify({ 
            error: "environment must be either 'production' or 'sandbox'" 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
    } catch {
      return new Response(
        JSON.stringify({ 
          error: "Invalid request body. Expected JSON with device_token field and optional environment field." 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    if (!customDeviceToken) {
      return new Response(
        JSON.stringify({ 
          error: "device_token is required in request body" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Use provided device token and environment
    console.log(`Using provided device token: ${customDeviceToken.substring(0, 10)}... with environment: ${environment}`);
    const deviceTokens: DeviceToken[] = [{
      device_token: customDeviceToken,
      platform: 'ios',
      permission_granted: true,
      apns_environment: environment
    }];

    // Fetch the most recent violation to use as test data
    console.log("Fetching most recent violation for test...");
    const { data: recentViolation, error: violationError } = await supabase
      .from('violations')
      .select('_id, casefile_number, address, parcel_id, status, investigation_date, violation_description, violation_code_section, violation_spec_instructions, investigation_outcome, investigation_findings')
      .order('_id', { ascending: false })
      .limit(1)
      .single();

    if (violationError) {
      console.error("Error fetching recent violation:", violationError);
    }

    // Create push service (environment is determined per-device)
    const pushService = new PushService(apnsTeamId, apnsKeyId, apnsPrivateKey, apnsBundleId, true);
    
    let testPayload: PushNotificationPayload;
    
    // If we have a recent violation, use the new logic
    if (recentViolation) {
      console.log(`Using recent violation at: ${recentViolation.address || 'Unknown Address'}`);
      testPayload = PushService.createPushPayload([recentViolation], []);
      // Mark it as a test
      testPayload.data = {
        ...testPayload.data,
        test: true,
        timestamp: new Date().toISOString()
      };
    } else {
      // Fallback to generic test message if no violations found
      console.log("No violations found, using generic test message");
      testPayload = {
        title: "Test Notification",
        body: "This is a test push notification from your app",
        data: {
          test: true,
          timestamp: new Date().toISOString(),
          type: 'test_notification'
        }
      };
    }

    // Send push notifications
    console.log("Sending test push notifications...");
    console.log("APNS Key ID:", apnsKeyId);
    console.log("APNS Team ID:", apnsTeamId);
    console.log("APNS Bundle ID:", apnsBundleId);
    const result = await pushService.sendPushNotifications(deviceTokens, testPayload);

    if (!result.success) {
      return new Response(
        JSON.stringify({ 
          error: "Push notification failed",
          details: result.errors,
          deviceCount: deviceTokens.length,
          payload: testPayload
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

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