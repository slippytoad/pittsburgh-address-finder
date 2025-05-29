
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { PropertyApiClient } from "./api-client.ts";
import { DatabaseService } from "./database-service.ts";
import { EmailService } from "./email-service.ts";
import { ViolationProcessor } from "./violation-processor.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting daily violation check...");

    // Initialize services
    const apiClient = new PropertyApiClient();
    const dbService = new DatabaseService(supabaseUrl, supabaseServiceKey);
    const emailService = new EmailService(resendApiKey);

    // Check if this is a test run
    const body = await req.text();
    let isTestRun = false;
    
    if (body) {
      try {
        const requestData = JSON.parse(body);
        isTestRun = requestData.test_run === true;
      } catch (e) {
        console.log("Body parsing failed, continuing with normal flow");
      }
    }

    if (isTestRun) {
      console.log("Test run detected - sending test email");
    }

    // Get app settings
    const settings = await dbService.getAppSettings();

    if (!settings?.email_reports_enabled || !settings?.email_report_address) {
      console.log("Email reports are disabled or no email address configured");
      return new Response(
        JSON.stringify({ message: "Email reports are disabled or not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle test run
    if (isTestRun) {
      const emailResponse = await emailService.sendTestEmail(settings.email_report_address, settings);
      console.log("Test email sent successfully:", emailResponse);

      return new Response(
        JSON.stringify({ 
          message: "Test email sent successfully",
          emailResponse: emailResponse
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch property data
    const apiData = await apiClient.fetchPropertyData();

    // Get existing violations and filter new ones
    const existingIds = await dbService.getExistingViolations();
    console.log('Found', existingIds.size, 'existing records in database');

    const newRecords = ViolationProcessor.filterNewRecords(apiData.result.records, existingIds);

    // Save new records if any exist
    if (newRecords.length > 0) {
      const violationRecords = ViolationProcessor.formatForDatabase(newRecords);
      await dbService.saveNewViolations(violationRecords);
    }

    // Send daily email notification
    const emailResponse = await emailService.sendDailyReport(
      settings.email_report_address, 
      newRecords, 
      apiData.result.records.length
    );

    console.log("Email sent successfully:", emailResponse);

    // Log the email notification
    await dbService.logEmailNotification(newRecords.length, settings.email_report_address);

    return new Response(
      JSON.stringify({ 
        message: "Daily check completed successfully",
        newRecordsCount: newRecords.length,
        emailSent: true
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in daily-violation-check function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
