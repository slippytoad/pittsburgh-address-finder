import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PropertyApiClient } from "./api-client.ts";
import { DatabaseService } from "./database-service.ts";
import { EmailService } from "./email-service.ts";
import { PushService } from "./push-service.ts";
import { ViolationProcessor } from "./violation-processor.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

// APNs configuration (optional)
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
    // Initialize Supabase client and services
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const dbService = new DatabaseService(supabase);
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
        // Continue with normal flow
      }
    }

    // Get app settings
    const settings = await dbService.getAppSettings();

    if (!skipEmail && (!settings?.email_reports_enabled || !settings?.email_report_address)) {
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
    const apiData = await apiClient.fetchPropertyData(isFullSync);

    // Get existing violation IDs, case numbers, and latest date to filter truly new records
    const existingIds = await dbService.getExistingViolationIds();
    const existingCaseNumbers = await dbService.getExistingCaseNumbers();
    const latestDate = isFullSync ? null : await dbService.getLatestViolationDate(); // Don't filter by date for full sync
    
    const filterResult = ViolationProcessor.filterNewRecords(
      apiData.result.records, 
      existingIds, 
      existingCaseNumbers,
      latestDate
    );

    // Save new records if any exist
    if (filterResult.newRecords.length > 0) {
      const violationRecords = ViolationProcessor.formatForDatabase(filterResult.newRecords);
      
      try {
        await dbService.saveNewViolations(violationRecords);
      } catch (saveError) {
        console.error("Failed to save violations:", saveError);
        // Continue with the rest of the process even if saving fails
      }
    }

    // Send hourly email notification with detailed breakdown (only if not skipping email and there are new violations)
    if (!skipEmail && settings?.email_reports_enabled && settings?.email_report_address && filterResult.newRecords.length > 0) {
      const emailResponse = await emailService.sendDailyReport(
        settings.email_report_address, 
        filterResult.newRecords, 
        apiData.result.records,
        filterResult.newCasefiles.length,
        filterResult.newRecordsForExistingCases.length,
        dbService // Pass the database service for querying open cases
      );

      console.log("Email sent successfully:", emailResponse);

      // Log the email notification with case breakdown
      try {
        await dbService.logEmailNotification(
          filterResult.newRecords.length, 
          filterResult.newCasefiles.length,
          settings.email_report_address
        );
      } catch (logError) {
        console.error("Failed to log email notification:", logError);
        // Don't fail the whole process for logging errors
      }
    }

    // Send push notifications (only if there are new violations and APNs is configured)
    if (filterResult.newRecords.length > 0 && apnsTeamId && apnsKeyId && apnsPrivateKey && apnsBundleId) {
      try {
        // Fetch device tokens with environment info
        const { data: deviceTokens, error: deviceError } = await supabase
          .from('push_settings')
          .select('device_token, platform, permission_granted, apns_environment')
          .eq('permission_granted', true);

        if (deviceError) {
          console.error('Error fetching device tokens:', deviceError);
        } else if (deviceTokens && deviceTokens.length > 0) {
          // Determine if we should use production environment
          // Use production if any device has 'production' environment or if not specified
          const isProduction = deviceTokens.some(token => 
            token.apns_environment === 'production' || !token.apns_environment
          );
          
          const pushService = new PushService(
            apnsTeamId, 
            apnsKeyId, 
            apnsPrivateKey, 
            apnsBundleId, 
            isProduction
          );
          
          // Create push payload with actual violation records
          const pushPayload = PushService.createPushPayload(
            filterResult.newCasefiles,
            filterResult.newRecordsForExistingCases
          );
          
          await pushService.sendPushNotifications(deviceTokens, pushPayload);
          console.log("Push notifications sent successfully");
        }
      } catch (pushError) {
        console.error("Failed to send push notifications:", pushError);
        // Don't fail the whole process for push notification errors
      }
    }

    // Update the last API check timestamp with the new records count
    try {
      await dbService.updateLastApiCheckTime(filterResult.newRecords.length);
    } catch (updateError) {
      console.error("Failed to update last API check time:", updateError);
      // Don't fail the whole process for timestamp update errors
    }

    return new Response(
      JSON.stringify({ 
        message: isFullSync ? "Full sync completed successfully" : "Hourly check completed successfully",
        newRecordsCount: filterResult.newRecords.length,
        newCasefilesCount: filterResult.newCasefiles.length,
        newRecordsForExistingCasesCount: filterResult.newRecordsForExistingCases.length,
        emailSent: !skipEmail && !!settings?.email_reports_enabled,
        savedSuccessfully: filterResult.newRecords.length > 0
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in hourly-violation-check function:", error);
    console.error("Error stack:", error.stack);
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
