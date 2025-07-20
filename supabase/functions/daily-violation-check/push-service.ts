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

export class PushService {
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
        sound: 'default',
        'mutable-content': 1
      },
      'attachment-url': 'https://72f422ba-d056-495b-be0e-dffed3e7e0a4.lovableproject.com/src/assets/logo.png',
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

  static createPushPayload(newRecordsCount: number, newCasefilesCount: number): PushNotificationPayload {
    let title = 'New Violations Found';
    let body = '';

    if (newRecordsCount === 1) {
      body = '1 new violation record found';
    } else {
      body = `${newRecordsCount} new violation records found`;
    }

    if (newCasefilesCount > 0) {
      body += ` (${newCasefilesCount} new case${newCasefilesCount > 1 ? 's' : ''})`;
    }

    return {
      title,
      body,
      data: {
        newRecordsCount,
        newCasefilesCount,
        type: 'violation_update'
      }
    };
  }
}