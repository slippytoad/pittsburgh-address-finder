-- Add unique constraint on device_token for push_settings table
-- This is needed for the upsert operation in register-push-settings edge function
ALTER TABLE public.push_settings 
ADD CONSTRAINT push_settings_device_token_unique UNIQUE (device_token);