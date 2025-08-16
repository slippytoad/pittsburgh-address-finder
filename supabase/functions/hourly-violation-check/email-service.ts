
import { Resend } from "npm:resend@2.0.0";
import { ViolationRecord } from "./types.ts";
import { DatabaseService } from "./database-service.ts";

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
      
      <p><a href="https://jfw-oakland.slippytoad.com" style="background-color: #2754C5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Dashboard</a></p>
      
      <p><em>This is a test message from the Property Investigation Dashboard.</em></p>
    `;

    return await this.resend.emails.send({
      from: "JFW Oakland Property Reports <noreply@slippytoad.com>",
      to: [emailAddress],
      subject: emailSubject,
      html: emailBody,
    });
  }

  private groupRecordsByCase(records: ViolationRecord[]) {
    const grouped = records.reduce((acc, record) => {
      const caseNumber = record.casefile_number || 'Unknown';
      
      if (!acc[caseNumber]) {
        acc[caseNumber] = [];
      }
      acc[caseNumber].push(record);
      
      return acc;
    }, {} as Record<string, ViolationRecord[]>);

    return Object.entries(grouped).map(([caseNumber, caseRecords]) => {
      // Sort records by date to get the most recent
      const sortedRecords = caseRecords.sort((a, b) => 
        new Date(b.investigation_date || '').getTime() - new Date(a.investigation_date || '').getTime()
      );
      
      const latestRecord = sortedRecords[0];
      
      return {
        casefileNumber: caseNumber,
        currentStatus: latestRecord.status || 'Unknown',
        records: sortedRecords,
        latestDate: latestRecord.investigation_date || ''
      };
    }).sort((a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime());
  }

  private async getOpenCasesSummary(dbService: DatabaseService): Promise<string> {
    try {
      // Get the status counts for open (non-closed) cases from the database
      const statusCounts = await dbService.getOpenCasesCountByStatus();
      
      const dashboardUrl = "https://jfw-oakland.slippytoad.com";

      return Object.entries(statusCounts)
        .map(([status, count]) => {
          const statusParam = encodeURIComponent(status);
          const statusLink = `${dashboardUrl}?status=${statusParam}`;
          return `<li><strong><a href="${statusLink}" style="color: #2754C5; text-decoration: none;">${status}</a>:</strong> ${count}</li>`;
        })
        .join('');
    } catch (error) {
      console.error('Error getting open cases summary:', error);
      // Fallback to the old method if database query fails
      return '<li>Unable to retrieve case status counts</li>';
    }
  }

  private formatNewRecordsList(newRecords: ViolationRecord[]): string {
    const dashboardUrl = "https://jfw-oakland.slippytoad.com";
    
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

  async sendDailyReport(emailAddress: string, newRecords: ViolationRecord[], allRecords: ViolationRecord[], newCasefilesCount: number, newRecordsForExistingCasesCount: number, dbService: DatabaseService): Promise<any> {
    console.log('Sending daily email notification to:', emailAddress);
    
    let emailSubject: string;
    let emailBody: string;

    const statusSummary = await this.getOpenCasesSummary(dbService);
    const dashboardUrl = "https://jfw-oakland.slippytoad.com";
    const currentDate = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    if (newRecords.length > 0) {
      // Email for when new violations are found
      const hasUpdatesOnly = newCasefilesCount === 0 && newRecordsForExistingCasesCount > 0;
      const hasBothNewAndUpdated = newCasefilesCount > 0 && newRecordsForExistingCasesCount > 0;
      
      if (hasUpdatesOnly) {
        emailSubject = `JFW Oakland Violations Report - ${newRecords.length} updated violation${newRecords.length > 1 ? 's' : ''}`;
        emailBody = `
          <h2>Daily Property Violation Report - ${currentDate}</h2>
          <p>We found <strong>${newRecords.length} updated violation${newRecords.length > 1 ? 's' : ''}</strong> during today's check.</p>
          
          <h3>Updated Records (click case numbers for direct access):</h3>
          <ul style="list-style-type: none; padding: 0;">
            ${this.formatNewRecordsList(newRecords)}
            ${newRecords.length > 10 ? `<li><em>... and ${newRecords.length - 10} more records</em></li>` : ''}
          </ul>`;
      } else if (hasBothNewAndUpdated) {
        emailSubject = `JFW Oakland Violations Report - ${newCasefilesCount} new and ${newRecordsForExistingCasesCount} updated violation${(newCasefilesCount + newRecordsForExistingCasesCount) > 1 ? 's' : ''}`;
        emailBody = `
          <h2>Daily Property Violation Report - ${currentDate}</h2>
          <p>We found <strong>${newCasefilesCount} new and ${newRecordsForExistingCasesCount} updated violation${(newCasefilesCount + newRecordsForExistingCasesCount) > 1 ? 's' : ''}</strong> during today's check.</p>
          
          <h3>New and Updated Records (click case numbers for direct access):</h3>
          <ul style="list-style-type: none; padding: 0;">
            ${this.formatNewRecordsList(newRecords)}
            ${newRecords.length > 10 ? `<li><em>... and ${newRecords.length - 10} more records</em></li>` : ''}
          </ul>`;
      } else {
        emailSubject = `JFW Oakland Violations Report - ${newRecords.length} new violation${newRecords.length > 1 ? 's' : ''} found`;
        emailBody = `
          <h2>Daily Property Violation Report - ${currentDate}</h2>
          <p>We found <strong>${newRecords.length} new violation${newRecords.length > 1 ? 's' : ''}</strong> during today's check.</p>
          
          <h3>New Records (click case numbers for direct access):</h3>
          <ul style="list-style-type: none; padding: 0;">
            ${this.formatNewRecordsList(newRecords)}
            ${newRecords.length > 10 ? `<li><em>... and ${newRecords.length - 10} more records</em></li>` : ''}
          </ul>`;
      }
      
      emailBody += `
        <h3>Number of open cases in each state:</h3>
        <ul>
          ${statusSummary}
        </ul>
        
        <p><a href="${dashboardUrl}" style="background-color: #2754C5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Full Dashboard</a></p>
        
        <p><em>This is an automated message from the Property Investigation Dashboard.</em></p>
      `;
    } else {
      // Email for when no new violations are found
      emailSubject = `JFW Oakland Violations Report - No new violations found`;
      emailBody = `
        <h2>Daily Property Violation Report - ${currentDate}</h2>
        <p>We completed today's check and <strong>no new violations</strong> were found.</p>
        
        <h3>Number of open cases in each state:</h3>
        <ul>
          ${statusSummary}
        </ul>
        
        <p>The system will continue to monitor for new violations and notify you when they are found.</p>
        
        <p><a href="${dashboardUrl}" style="background-color: #2754C5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Dashboard</a></p>
        
        <p><em>This is an automated message from the Property Investigation Dashboard.</em></p>
      `;
    }

    return await this.resend.emails.send({
      from: "JFW Oakland Property Reports <noreply@slippytoad.com>",
      to: [emailAddress],
      subject: emailSubject,
      html: emailBody,
    });
  }
}
