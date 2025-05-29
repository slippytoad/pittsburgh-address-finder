
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
      
      <p><a href="https://pittsburgh-address-finder.lovable.app" style="background-color: #2754C5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Dashboard</a></p>
      
      <p><em>This is a test message from the Property Investigation Dashboard.</em></p>
    `;

    return await this.resend.emails.send({
      from: "Property Alerts <onboarding@resend.dev>",
      to: [emailAddress],
      subject: emailSubject,
      html: emailBody,
    });
  }

  private getStatusSummary(allRecords: ViolationRecord[]): string {
    // Group records by case file number
    const caseGroups: Record<string, ViolationRecord[]> = {};
    
    allRecords.forEach(record => {
      const caseNumber = record.casefile_number || 'Unknown';
      if (!caseGroups[caseNumber]) {
        caseGroups[caseNumber] = [];
      }
      caseGroups[caseNumber].push(record);
    });

    // Get the latest status for each case
    const caseCounts: Record<string, number> = {};
    
    Object.values(caseGroups).forEach(caseRecords => {
      // Sort by investigation date to get the latest record
      const sortedRecords = caseRecords.sort((a, b) => 
        new Date(b.investigation_date || '').getTime() - new Date(a.investigation_date || '').getTime()
      );
      
      const latestStatus = sortedRecords[0]?.status || 'Unknown';
      caseCounts[latestStatus] = (caseCounts[latestStatus] || 0) + 1;
    });

    const dashboardUrl = "https://pittsburgh-address-finder.lovable.app";

    return Object.entries(caseCounts)
      .map(([status, count]) => {
        const statusParam = encodeURIComponent(status);
        const statusLink = `${dashboardUrl}?status=${statusParam}`;
        return `<li><strong><a href="${statusLink}" style="color: #2754C5; text-decoration: none;">${status}</a>:</strong> ${count}</li>`;
      })
      .join('');
  }

  private formatNewRecordsList(newRecords: ViolationRecord[]): string {
    const dashboardUrl = "https://pittsburgh-address-finder.lovable.app";
    
    return newRecords.slice(0, 10).map((record: any) => {
      const caseParam = encodeURIComponent(record.casefile_number || '');
      const caseLink = `${dashboardUrl}?case=${caseParam}`;
      
      return `
        <li style="margin-bottom: 15px; padding: 10px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <strong>Address:</strong> ${record.address || 'N/A'}<br>
          <strong>Case File:</strong> <a href="${caseLink}" style="color: #2754C5; text-decoration: none;">${record.casefile_number || 'N/A'}</a><br>
          <strong>Status:</strong> ${record.status || 'N/A'}<br>
          <strong>Investigation Date:</strong> ${record.investigation_date || 'N/A'}<br>
          <strong>Description:</strong> ${record.violation_description || 'N/A'}
        </li>
      `;
    }).join('');
  }

  async sendDailyReport(emailAddress: string, newRecords: ViolationRecord[], allRecords: ViolationRecord[]): Promise<any> {
    console.log('Sending daily email notification to:', emailAddress);
    
    let emailSubject: string;
    let emailBody: string;

    const statusSummary = this.getStatusSummary(allRecords);
    const dashboardUrl = "https://pittsburgh-address-finder.lovable.app";

    if (newRecords.length > 0) {
      // Email for when new violations are found
      emailSubject = `New Property Violations Found - ${newRecords.length} records`;
      emailBody = `
        <h2>Daily Property Violation Report</h2>
        <p>We found <strong>${newRecords.length} new violations</strong> during today's check.</p>
        
        <h3>New Records (click case numbers for direct access):</h3>
        <ul style="list-style-type: none; padding: 0;">
          ${this.formatNewRecordsList(newRecords)}
          ${newRecords.length > 10 ? `<li><em>... and ${newRecords.length - 10} more records</em></li>` : ''}
        </ul>
        
        <h3>Check Summary - Number of cases in each state (click to filter):</h3>
        <ul>
          ${statusSummary}
        </ul>
        
        <p><a href="${dashboardUrl}" style="background-color: #2754C5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Full Dashboard</a></p>
        
        <p><em>This is an automated message from the Property Investigation Dashboard.</em></p>
      `;
    } else {
      // Email for when no new violations are found
      emailSubject = `Daily Property Violation Report - No New Violations Found`;
      emailBody = `
        <h2>Daily Property Violation Report</h2>
        <p>We completed today's check and <strong>no new violations</strong> were found.</p>
        
        <h3>Check Summary - Number of cases in each state (click to filter):</h3>
        <ul>
          ${statusSummary}
        </ul>
        
        <p>The system will continue to monitor for new violations and notify you when they are found.</p>
        
        <p><a href="${dashboardUrl}" style="background-color: #2754C5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Dashboard</a></p>
        
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
