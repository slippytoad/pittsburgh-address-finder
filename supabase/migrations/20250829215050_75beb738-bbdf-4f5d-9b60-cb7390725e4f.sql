-- Allow null user_id for anonymous push notification registration
-- This enables anonymous users to register for push notifications
ALTER TABLE public.push_settings 
ALTER COLUMN user_id DROP NOT NULL;