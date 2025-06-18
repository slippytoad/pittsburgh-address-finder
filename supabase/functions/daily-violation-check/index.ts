
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
    console.log("Using Supabase URL:", supabaseUrl);
    console.log("Service key available:", !!supabaseServiceKey);

    // Initialize services
    const dbService = new DatabaseService(supabaseUrl, supabaseServiceKey);
    const apiClient = new PropertyApiClient(dbService);
    const emailService = new EmailService(resendApiKey);

    // Check if this is a test run, full sync, or skip email
    const body = await req.text();
    let isTestRun = false;
    let isFullSync = false;
    let skipEmail = false;
    
    if (body) {
      try {
        const requestData = JSON.parse(body);
        isTestRun = requestData.test_run === true;
        isFullSync = requestData.full_sync === true;
        skipEmail = requestData.skip_email === true;
      } catch (e) {
        console.log("Body parsing failed, continuing with normal flow");
      }
    }

    if (isTestRun) {
      console.log("Test run detected - sending test email");
    }

    if (isFullSync) {
      console.log("Full sync detected - will fetch data from 2024");
    }

    if (skipEmail) {
      console.log("Skip email detected - no email will be sent");
    }

    // Get app settings
    console.log("Fetching app settings...");
    const settings = await dbService.getAppSettings();

    if (!skipEmail && (!settings?.email_reports_enabled || !settings?.email_report_address)) {
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

    // Fetch property data (with full sync parameter if needed)
    console.log("Fetching property data from API...");
    const apiData = await apiClient.fetchPropertyData(isFullSync);
    console.log("API returned", apiData.result.records.length, "total records");

    // Get existing violation IDs, case numbers, and latest date to filter truly new records
    console.log("Getting existing violations, case numbers, and latest date...");
    const existingIds = await dbService.getExistingViolationIds();
    const existingCaseNumbers = await dbService.getExistingCaseNumbers();
    const latestDate = isFullSync ? null : await dbService.getLatestViolationDate(); // Don't filter by date for full sync
    
    console.log("Filtering new records...");
    const filterResult = ViolationProcessor.filterNewRecords(
      apiData.result.records, 
      existingIds, 
      existingCaseNumbers,
      latestDate
    );
    
    console.log("Found", filterResult.newRecords.length, "total new records to save");
    console.log("- New records for existing cases:", filterResult.newRecordsForExistingCases.length);
    console.log("- New casefiles:", filterResult.newCasefiles.length);

    // Save new records if any exist
    if (filterResult.newRecords.length > 0) {
      console.log("Formatting", filterResult.newRecords.length, "records for database...");
      const violationRecords = ViolationProcessor.formatForDatabase(filterResult.newRecords);
      
      console.log("Saving new violations to database...");
      try {
        await dbService.saveNewViolations(violationRecords);
        console.log("Successfully saved", filterResult.newRecords.length, "new violations");
      } catch (saveError) {
        console.error("Failed to save violations:", saveError);
        // Continue with the rest of the process even if saving fails
      }
    } else {
      console.log("No new violations to save");
    }

    // Send daily email notification with detailed breakdown (only if not skipping email)
    if (!skipEmail && settings?.email_reports_enabled && settings?.email_report_address) {
      console.log("Sending daily email report...");
      const emailResponse = await emailService.sendDailyReport(
        settings.email_report_address, 
        filterResult.newRecords, 
        apiData.result.records,
        filterResult.newCasefiles.length,
        filterResult.newRecordsForExistingCases.length
      );

      console.log("Email sent successfully:", emailResponse);

      // Log the email notification with case breakdown
      try {
        await dbService.logEmailNotification(
          filterResult.newRecords.length, 
          filterResult.newCasefiles.length,
          settings.email_report_address
        );
        console.log("Email notification logged successfully");
      } catch (logError) {
        console.error("Failed to log email notification:", logError);
        // Don't fail the whole process for logging errors
      }
    } else {
      console.log("Skipping email notification");
    }

    // Update the last API check timestamp with the new records count
    try {
      await dbService.updateLastApiCheckTime(filterResult.newRecords.length);
      console.log("Last API check timestamp updated with new records count:", filterResult.newRecords.length);
    } catch (updateError) {
      console.error("Failed to update last API check time:", updateError);
      // Don't fail the whole process for timestamp update errors
    }

    return new Response(
      JSON.stringify({ 
        message: isFullSync ? "Full sync completed successfully" : "Daily check completed successfully",
        newRecordsCount: filterResult.newRecords.length,
        newCasefilesCount: filterResult.newCasefiles.length,
        newRecordsForExistingCasesCount: filterResult.newRecordsForExistingCases.length,
        emailSent: !skipEmail && !!settings?.email_reports_enabled,
        savedSuccessfully: filterResult.newRecords.length > 0
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in daily-violation-check function:", error);
    console.error("Error stack:", error.stack);
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
