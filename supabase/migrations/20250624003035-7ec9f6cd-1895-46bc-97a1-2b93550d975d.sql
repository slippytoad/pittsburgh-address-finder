
-- Add SMS notification fields to app_settings table
ALTER TABLE public.app_settings 
ADD COLUMN sms_reports_enabled BOOLEAN DEFAULT false,
ADD COLUMN sms_report_phone TEXT;
