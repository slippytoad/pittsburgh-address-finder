
import { Resend } from "npm:resend@2.0.0";
import { ViolationRecord } from "./types.ts";

export class EmailService {
  private resend: Resend;

  constructor(resendApiKey: string) {
    this.resend = new Resend(resendApiKey);
  }

  async sendTestEmail(emailAddress: string, settings: any): Promise<any> {
    console.log('Sending test email to:', emailAddress);
    
    const emailSubject = `Test Email - Property Violation System`;
    const emailBody = `
      <h2>Test Email from Property Violation System</h2>
      <p>This is a test email to verify that your email notification system is working correctly.</p>
      
      <h3>System Status:</h3>
      <ul>
        <li><strong>Email Reports:</strong> Enabled</li>
        <li><strong>Email Address:</strong> ${emailAddress}</li>
        <li><strong>Violation Checks:</strong> ${settings.violation_checks_enabled ? 'Enabled' : 'Disabled'}</li>
        <li><strong>Test Time:</strong> ${new Date().toISOString()}</li>
      </ul>
      
      <p>If you received this email, your notification system is working properly!</p>
      
      <p><em>This is a test message from the Property Investigation Dashboard.</em></p>
    `;

    return await this.resend.emails.send({
      from: "Property Alerts <onboarding@resend.dev>",
      to: [emailAddress],
      subject: emailSubject,
      html: emailBody,
    });
  }

  async sendDailyReport(emailAddress: string, newRecords: ViolationRecord[], totalRecords: number): Promise<any> {
    console.log('Sending daily email notification to:', emailAddress);
    
    let emailSubject: string;
    let emailBody: string;

    if (newRecords.length > 0) {
      // Email for when new violations are found
      emailSubject = `New Property Violations Found - ${newRecords.length} records`;
      emailBody = `
        <h2>Daily Property Violation Report</h2>
        <p>We found <strong>${newRecords.length} new violations</strong> during today's check.</p>
        
        <h3>New Records Summary:</h3>
        <ul>
          ${newRecords.slice(0, 10).map((record: any) => `
            <li>
              <strong>Address:</strong> ${record.address || 'N/A'}<br>
              <strong>Case File:</strong> ${record.casefile_number || 'N/A'}<br>
              <strong>Status:</strong> ${record.status || 'N/A'}<br>
              <strong>Investigation Date:</strong> ${record.investigation_date || 'N/A'}<br>
              <strong>Description:</strong> ${record.violation_description || 'N/A'}
            </li>
          `).join('')}
          ${newRecords.length > 10 ? `<li><em>... and ${newRecords.length - 10} more records</em></li>` : ''}
        </ul>
        
        <p>Please log into the system to view all details.</p>
        
        <p><em>This is an automated message from the Property Investigation Dashboard.</em></p>
      `;
    } else {
      // Email for when no new violations are found
      emailSubject = `Daily Property Violation Report - No New Violations Found`;
      emailBody = `
        <h2>Daily Property Violation Report</h2>
        <p>We completed today's check and <strong>no new violations</strong> were found.</p>
        
        <h3>Check Summary:</h3>
        <ul>
          <li><strong>Total violations since 2024:</strong> ${totalRecords}</li>
          <li><strong>New violations found:</strong> 0</li>
        </ul>
        
        <p>The system will continue to monitor for new violations and notify you when they are found.</p>
        
        <p><em>This is an automated message from the Property Investigation Dashboard.</em></p>
      `;
    }

    return await this.resend.emails.send({
      from: "Property Alerts <onboarding@resend.dev>",
      to: [emailAddress],
      subject: emailSubject,
      html: emailBody,
    });
  }
}
