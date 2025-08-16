
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

export class PushService {
  private teamId: string;
  private keyId: string;
  private privateKey: string;
  private bundleId: string;
  private isProduction: boolean;
  
  // JWT caching properties
  private cachedJWT: string | null = null;
  private jwtExpirationTime: number = 0;
  private readonly JWT_CACHE_DURATION = 3600 * 1000; // 60 minutes in milliseconds

  constructor(teamId: string, keyId: string, privateKey: string, bundleId: string, isProduction: boolean = true) {
    this.teamId = teamId;
    this.keyId = keyId;
    this.privateKey = privateKey;
    this.bundleId = bundleId;
    this.isProduction = isProduction;
  }

  private getApnsUrl(): string {
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
      iat: Math.floor(Date.now() / 1000)
    };

    const headerB64 = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    const payloadB64 = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    
    const signingInput = `${headerB64}.${payloadB64}`;
    
    try {
      // Clean and format the private key
      let cleanKey = this.privateKey.trim();
      
      // If the key doesn't have headers, add them
      if (!cleanKey.includes('-----BEGIN')) {
        cleanKey = `-----BEGIN PRIVATE KEY-----\n${cleanKey}\n-----END PRIVATE KEY-----`;
      }
      
      // Extract just the key content
      const keyContent = cleanKey
        .replace(/-----BEGIN PRIVATE KEY-----/g, '')
        .replace(/-----END PRIVATE KEY-----/g, '')
        .replace(/\s/g, '');
      
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

      return `${headerB64}.${payloadB64}.${signatureB64}`;
    } catch (error) {
      console.error('JWT generation error:', error);
      throw new Error(`Failed to generate JWT: ${error.message}`);
    }
  }

  private async getCachedJWT(): Promise<string> {
    const currentTime = Date.now();
    
    // Check if we have a valid cached JWT (with 5 minutes buffer before expiration)
    if (this.cachedJWT && currentTime < (this.jwtExpirationTime - 5 * 60 * 1000)) {
      console.log('Using cached JWT token');
      return this.cachedJWT;
    }
    
    // Generate a new JWT and cache it
    console.log('Generating new JWT token for caching');
    this.cachedJWT = await this.generateJWT();
    this.jwtExpirationTime = currentTime + this.JWT_CACHE_DURATION;
    
    return this.cachedJWT;
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
        
        // Use cached JWT to avoid TooManyProviderTokenUpdates error
        const jwt = await this.getCachedJWT();
        
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
