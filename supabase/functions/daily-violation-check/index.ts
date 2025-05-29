
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting daily violation check...");

    // Check if this is a test run
    const body = await req.text();
    let isTestRun = false;
    
    if (body) {
      try {
        const requestData = JSON.parse(body);
        isTestRun = requestData.test_run === true;
      } catch (e) {
        // If body parsing fails, continue with normal flow
        console.log("Body parsing failed, continuing with normal flow");
      }
    }

    if (isTestRun) {
      console.log("Test run detected - sending test email");
    }

    // Check if email reports are enabled
    const { data: settings, error: settingsError } = await supabase
      .from("app_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (settingsError) {
      console.error("Error fetching app settings:", settingsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch app settings" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!settings?.email_reports_enabled || !settings?.email_report_address) {
      console.log("Email reports are disabled or no email address configured");
      return new Response(
        JSON.stringify({ message: "Email reports are disabled or not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If this is a test run, send test email immediately
    if (isTestRun) {
      console.log('Sending test email to:', settings.email_report_address);
      
      const emailSubject = `Test Email - Property Violation System`;
      const emailBody = `
        <h2>Test Email from Property Violation System</h2>
        <p>This is a test email to verify that your email notification system is working correctly.</p>
        
        <h3>System Status:</h3>
        <ul>
          <li><strong>Email Reports:</strong> Enabled</li>
          <li><strong>Email Address:</strong> ${settings.email_report_address}</li>
          <li><strong>Violation Checks:</strong> ${settings.violation_checks_enabled ? 'Enabled' : 'Disabled'}</li>
          <li><strong>Test Time:</strong> ${new Date().toISOString()}</li>
        </ul>
        
        <p>If you received this email, your notification system is working properly!</p>
        
        <p><em>This is a test message from the Property Investigation Dashboard.</em></p>
      `;

      const emailResponse = await resend.emails.send({
        from: "Property Alerts <onboarding@resend.dev>",
        to: [settings.email_report_address],
        subject: emailSubject,
        html: emailBody,
      });

      console.log("Test email sent successfully:", emailResponse);

      return new Response(
        JSON.stringify({ 
          message: "Test email sent successfully",
          emailResponse: emailResponse
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Continue with normal violation check process
    // Fetch property data from the API
    const apiUrl = 'https://data.wprdc.org/api/3/action/datastore_search_sql?sql=SELECT%20%2A%20FROM%20%2270c06278-92c5-4040-ab28-17671866f81c%22%20WHERE%20%28address%20ILIKE%20%2710%20Edith%20Place%25%27%20OR%20address%20ILIKE%20%2712%20Edith%20Place%25%27%20OR%20address%20ILIKE%20%273210%20Dawson%20St%25%27%20OR%20address%20ILIKE%20%273220%20Dawson%20St%25%27%20OR%20address%20ILIKE%20%273227%20Dawson%20St%20Units%201%262%25%27%20OR%20address%20ILIKE%20%273228%20Dawson%20St%25%27%20OR%20address%20ILIKE%20%273230%20Dawson%20St%25%27%20OR%20address%20ILIKE%20%273232%20Dawson%20St%25%27%20OR%20address%20ILIKE%20%27109%20Oakland%20Ct%25%27%20OR%20address%20ILIKE%20%2725%20Edith%20Pl%25%27%20OR%20address%20ILIKE%20%273206%20Dawson%20St%20Units%201-3%25%27%20OR%20address%20ILIKE%20%273208%20Dawson%20St%20Units%201%262%25%27%20OR%20address%20ILIKE%20%273431%20Parkview%20Ave%25%27%20OR%20address%20ILIKE%20%273433%20Parkview%20Ave%20Units%201%262%25%27%20OR%20address%20ILIKE%20%275419%20Potter%20St%25%27%20OR%20address%20ILIKE%20%2719%20Edith%20Pl%25%27%20OR%20address%20ILIKE%20%2720%20Edith%20Pl%25%27%20OR%20address%20ILIKE%20%273341%20Parkview%20Ave%25%27%20OR%20address%20ILIKE%20%273343%20Parkview%20Ave%25%27%20OR%20address%20ILIKE%20%273707%20Orpwood%20St%25%27%20OR%20address%20ILIKE%20%273709%20Orpwood%20St%25%27%20OR%20address%20ILIKE%20%273711%20Orpwood%20St%20Units%201%262%25%27%20OR%20address%20ILIKE%20%273817%20Bates%20St%25%27%29%20AND%20investigation_date%20%3E%3D%20%272024-01-01%27%20ORDER%20BY%20investigation_date%20DESC';
    
    console.log("Fetching property data from API...");
    const apiResponse = await fetch(apiUrl);
    
    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }
    
    const apiData = await apiResponse.json();
    console.log("API Response received:", apiData?.result?.records?.length || 0, "records");

    if (!apiData.success || !apiData.result?.records) {
      throw new Error("Invalid API response format");
    }

    // Get existing record IDs from database
    const { data: existingRecords, error: fetchError } = await supabase
      .from('violations')
      .select('_id');

    if (fetchError) {
      console.error('Error fetching existing violations:', fetchError);
      throw new Error(`Failed to fetch existing violations: ${fetchError.message}`);
    }

    const existingIds = new Set(existingRecords?.map(record => record._id) || []);
    console.log('Found', existingIds.size, 'existing records in database');

    // Filter out records that already exist
    const newRecords = apiData.result.records.filter((record: any) => !existingIds.has(record._id));
    console.log('Found', newRecords.length, 'new records');

    if (newRecords.length === 0) {
      console.log('No new records found, no email will be sent');
      return new Response(
        JSON.stringify({ message: "No new records found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save new records to database
    const violationRecords = newRecords.map((record: any) => ({
      _id: record._id,
      casefile_number: record.casefile_number || null,
      address: record.address || null,
      parcel_id: record.parcel_id || null,
      status: record.status || null,
      investigation_date: record.investigation_date || null,
      violation_description: record.violation_description || null,
      violation_code_section: record.violation_code_section || null,
      violation_spec_instructions: record.violation_spec_instructions || null,
      investigation_outcome: record.investigation_outcome || null,
      investigation_findings: record.investigation_findings || null,
    }));

    const { error: insertError } = await supabase
      .from('violations')
      .insert(violationRecords);

    if (insertError) {
      console.error('Error saving new violations:', insertError);
      throw new Error(`Failed to save new violations: ${insertError.message}`);
    }

    console.log('Successfully saved', newRecords.length, 'new violations to database');

    // Send email notification
    console.log('Sending email notification to:', settings.email_report_address);
    
    const emailSubject = `New Property Violations Found - ${newRecords.length} records`;
    const emailBody = `
      <h2>Daily Property Violation Report</h2>
      <p>We found <strong>${newRecords.length} new violation records</strong> during today's check.</p>
      
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

    const emailResponse = await resend.emails.send({
      from: "Property Alerts <onboarding@resend.dev>",
      to: [settings.email_report_address],
      subject: emailSubject,
      html: emailBody,
    });

    console.log("Email sent successfully:", emailResponse);

    // Log the email notification
    const { error: logError } = await supabase
      .from('email_notifications')
      .insert({
        new_records_count: newRecords.length,
        email_address: settings.email_report_address,
        status: 'sent'
      });

    if (logError) {
      console.error('Error logging email notification:', logError);
      // Don't throw here - the email was sent successfully
    }

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
