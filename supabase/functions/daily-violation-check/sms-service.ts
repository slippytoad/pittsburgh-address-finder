
export class SmsService {
  private accountSid: string;
  private authToken: string;

  constructor(accountSid: string, authToken: string) {
    this.accountSid = accountSid;
    this.authToken = authToken;
  }

  async sendNewViolationsAlert(
    phoneNumber: string, 
    newRecordsCount: number,
    newCasefilesCount: number,
    newRecordsForExistingCasesCount: number
  ): Promise<any> {
    console.log(`Sending SMS alert to: ${phoneNumber}`);
    
    // Create concise SMS message
    const message = this.formatNewViolationsMessage(
      newRecordsCount, 
      newCasefilesCount, 
      newRecordsForExistingCasesCount
    );

    return await this.sendSms(phoneNumber, message);
  }

  async sendTestSms(phoneNumber: string): Promise<any> {
    console.log(`Sending test SMS to: ${phoneNumber}`);
    
    const message = "JFW Oakland: This is a test SMS notification. Your SMS alerts are working correctly!";
    
    return await this.sendSms(phoneNumber, message);
  }

  private formatNewViolationsMessage(
    newRecordsCount: number,
    newCasefilesCount: number,
    newRecordsForExistingCasesCount: number
  ): string {
    let message = `JFW Oakland: Found ${newRecordsCount} new violation${newRecordsCount !== 1 ? 's' : ''} today`;
    
    if (newCasefilesCount > 0 || newRecordsForExistingCasesCount > 0) {
      message += '\n';
      if (newCasefilesCount > 0) {
        message += `• ${newCasefilesCount} new case${newCasefilesCount !== 1 ? 's' : ''}`;
      }
      if (newRecordsForExistingCasesCount > 0) {
        if (newCasefilesCount > 0) message += '\n';
        message += `• ${newRecordsForExistingCasesCount} update${newRecordsForExistingCasesCount !== 1 ? 's' : ''} to existing cases`;
      }
    }
    
    return message;
  }

  private async sendSms(phoneNumber: string, message: string): Promise<any> {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
    
    const body = new URLSearchParams({
      To: phoneNumber,
      From: '+18447418618', // Default Twilio number - user should replace with their own
      Body: message
    });

    const auth = btoa(`${this.accountSid}:${this.authToken}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Twilio API error:', errorText);
        throw new Error(`Twilio API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('SMS sent successfully:', result);
      return { data: result, error: null };
    } catch (error) {
      console.error('Error sending SMS:', error);
      return { data: null, error: error };
    }
  }
}
