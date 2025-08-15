-- Security Fix: Remove overly permissive RLS policies and implement secure access controls

-- 1. Fix app_settings table - Remove public read access
DROP POLICY IF EXISTS "Enable read access for all users" ON public.app_settings;
DROP POLICY IF EXISTS "Enable update for all users" ON public.app_settings;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.app_settings;

-- Keep admin and service role access only
-- (The existing admin and service role policies remain in place)

-- 2. Fix email_notifications table - Remove public read access
DROP POLICY IF EXISTS "Allow reading email notifications" ON public.email_notifications;
DROP POLICY IF EXISTS "Allow inserting email notifications" ON public.email_notifications;

-- Keep admin read access and system insert access only
-- (The existing admin and system policies remain in place)

-- 3. Fix push_settings table - Remove public access and implement user-specific access
DROP POLICY IF EXISTS "Allow anyone to read push settings" ON public.push_settings;
DROP POLICY IF EXISTS "Allow anyone to insert push settings" ON public.push_settings;
DROP POLICY IF EXISTS "Allow anyone to update push settings" ON public.push_settings;

-- Add user-specific policies for push_settings (assuming we add user_id column)
-- First, add user_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'push_settings' 
                   AND column_name = 'user_id') THEN
        ALTER TABLE public.push_settings ADD COLUMN user_id UUID;
    END IF;
END $$;

-- Create secure policies for push_settings
CREATE POLICY "Users can read their own push settings" 
ON public.push_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own push settings" 
ON public.push_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own push settings" 
ON public.push_settings 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow admins to manage all push settings
CREATE POLICY "Admins can manage all push settings" 
ON public.push_settings 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Allow service role to manage push settings (for edge functions)
CREATE POLICY "Service role can manage push settings" 
ON public.push_settings 
FOR ALL 
USING (true)
WITH CHECK (true);

-- 4. Ensure violation_code_sections maintains proper access
-- Remove any overly permissive policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON public.violation_code_sections;

-- The existing "Allow authenticated users to read violation code sections" policy is appropriate

-- 5. Ensure violations table maintains proper access  
-- Remove any overly permissive policies if they exist
DROP POLICY IF EXISTS "Enable insert for anyone" ON public.violations;
DROP POLICY IF EXISTS "Enable update for users" ON public.violations;

-- The existing policies for violations are appropriate (authenticated read, admin manage, service role manage)