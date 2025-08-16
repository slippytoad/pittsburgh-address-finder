-- Fix security issue with push_settings table in two steps
-- Step 1: Handle existing NULL user_id records and improve RLS policies

-- Delete records with NULL user_id as they represent orphaned/invalid device tokens
-- These records cannot be associated with any user and pose a security risk
DELETE FROM public.push_settings WHERE user_id IS NULL;

-- Now make user_id NOT NULL to prevent future security issues
ALTER TABLE public.push_settings 
ALTER COLUMN user_id SET NOT NULL;

-- Drop existing policies and recreate them with more explicit security
DROP POLICY IF EXISTS "Users can read their own push settings" ON public.push_settings;
DROP POLICY IF EXISTS "Users can insert their own push settings" ON public.push_settings;
DROP POLICY IF EXISTS "Users can update their own push settings" ON public.push_settings;
DROP POLICY IF EXISTS "Admins can manage all push settings" ON public.push_settings;
DROP POLICY IF EXISTS "Service role can manage push settings" ON public.push_settings;

-- Create more secure policies that explicitly check for authenticated users
-- These policies ensure only authenticated users can access their own device tokens
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

-- Admins can manage all push settings (for administrative purposes only)
CREATE POLICY "Admins can manage all push settings" 
ON public.push_settings 
FOR ALL 
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Service role access (for edge functions that need to manage push settings)
-- This is restricted to service_role only, not accessible to regular users
CREATE POLICY "Service role can manage push settings" 
ON public.push_settings 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);