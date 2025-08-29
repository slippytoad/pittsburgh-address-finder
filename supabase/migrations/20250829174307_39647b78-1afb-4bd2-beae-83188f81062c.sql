-- Fix security issue: Remove public access to addresses table
-- The addresses table contains sensitive residential information that should not be publicly accessible

-- Drop the problematic public access policy
DROP POLICY IF EXISTS "Enable read access for all users" ON public.addresses;

-- Update the authenticated users policy to properly restrict to authenticated users only
DROP POLICY IF EXISTS "Authenticated users can read addresses" ON public.addresses;

-- Create a new policy that only allows authenticated users to read addresses
CREATE POLICY "Authenticated users can read addresses" 
ON public.addresses 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Keep the admin modification policy as is (it's already secure)
-- "Only admins can modify addresses" policy remains unchanged