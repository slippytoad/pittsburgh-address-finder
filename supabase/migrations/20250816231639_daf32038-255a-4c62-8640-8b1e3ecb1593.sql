-- Fix security issue with push_settings table
-- The main issue is that user_id can be NULL, which can bypass RLS policies

-- First, let's update any records with NULL user_id to prevent orphaned records
-- Note: This might need manual intervention if there are existing NULL records
-- For now, we'll just ensure the constraint for future records

-- Make user_id NOT NULL to prevent bypassing RLS policies
ALTER TABLE public.push_settings 
ALTER COLUMN user_id SET NOT NULL;

-- Drop existing policies and recreate them with more explicit security
DROP POLICY IF EXISTS "Users can read their own push settings" ON public.push_settings;
DROP POLICY IF EXISTS "Users can insert their own push settings" ON public.push_settings;
DROP POLICY IF EXISTS "Users can update their own push settings" ON public.push_settings;
DROP POLICY IF EXISTS "Admins can manage all push settings" ON public.push_settings;
DROP POLICY IF EXISTS "Service role can manage push settings" ON public.push_settings;

-- Create more secure policies that explicitly check for authenticated users
CREATE POLICY "Users can read only their own push settings" 
ON public.push_settings 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid() AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert only their own push settings" 
ON public.push_settings 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid() AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update only their own push settings" 
ON public.push_settings 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid() AND auth.uid() IS NOT NULL)
WITH CHECK (user_id = auth.uid() AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete only their own push settings" 
ON public.push_settings 
FOR DELETE 
TO authenticated
USING (user_id = auth.uid() AND auth.uid() IS NOT NULL);

-- Admins can manage all push settings (for administrative purposes)
CREATE POLICY "Admins can manage all push settings" 
ON public.push_settings 
FOR ALL 
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Service role access (for edge functions that need to manage push settings)
CREATE POLICY "Service role can manage push settings" 
ON public.push_settings 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);