
-- This file documents the required app_settings table structure
-- The table should be created via the lov-sql block in the main conversation

CREATE TABLE IF NOT EXISTS public.app_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  email_reports_enabled BOOLEAN DEFAULT false,
  email_report_address TEXT,
  violation_checks_enabled BOOLEAN DEFAULT true,
  next_violation_check_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure only one settings record exists
  CONSTRAINT single_settings_row CHECK (id = 1)
);

-- Insert default settings if not exists
INSERT INTO public.app_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow reading app settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Allow updating app settings" ON public.app_settings FOR UPDATE USING (true);
CREATE POLICY "Allow inserting app settings" ON public.app_settings FOR INSERT WITH CHECK (true);
