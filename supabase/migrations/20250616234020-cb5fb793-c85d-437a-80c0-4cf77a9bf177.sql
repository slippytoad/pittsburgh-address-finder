
-- Complete security fix migration with proper type creation

-- First, add the missing column to app_settings for tracking new records
ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS last_api_new_records_count integer DEFAULT 0;

-- Create user roles enum (check if exists first)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'user');
    END IF;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

-- Enable RLS on all tables that don't have it
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might conflict
DROP POLICY IF EXISTS "Allow reading addresses" ON public.addresses;
DROP POLICY IF EXISTS "Allow reading app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Allow updating app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Allow inserting app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Only admins can modify violations" ON public.violations;
DROP POLICY IF EXISTS "Authenticated users can read violations" ON public.violations;

-- Create secure RLS policies for addresses table
CREATE POLICY "Authenticated users can read addresses"
ON public.addresses
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can modify addresses"
ON public.addresses
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Create secure RLS policies for app_settings table
CREATE POLICY "Only admins can read app settings"
ON public.app_settings
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Only admins can update app settings via UI"
ON public.app_settings
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Service role can update app settings"
ON public.app_settings
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can read app settings"
ON public.app_settings
FOR SELECT
TO service_role
USING (true);

CREATE POLICY "Only admins can insert app settings"
ON public.app_settings
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Create secure RLS policies for violations table
CREATE POLICY "Authenticated users can read violations"
ON public.violations
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Service role can manage violations"
ON public.violations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can manage violations"
ON public.violations
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Create secure RLS policies for email_notifications table
CREATE POLICY "Only admins can read email notifications"
ON public.email_notifications
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Only system can insert email notifications"
ON public.email_notifications
FOR INSERT
TO service_role
WITH CHECK (true);

-- Create secure RLS policies for user_roles table
CREATE POLICY "Users can read their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Only admins can manage user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Create trigger to automatically assign 'user' role to new signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  RETURN new;
END;
$$;

-- Create trigger for new user role assignment
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
