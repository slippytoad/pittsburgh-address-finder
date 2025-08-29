-- Fix security issue: Remove public access to violations table
-- The violations table contains sensitive property and violation information that should not be publicly accessible

-- Drop the problematic public access policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.violations;
DROP POLICY IF EXISTS "Authenticated users can read violations" ON public.violations;

-- Create a new policy that only allows authenticated users to read violations
CREATE POLICY "Authenticated users can read violations" 
ON public.violations 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Keep existing admin and service role policies as they are properly configured
-- "Admins can manage violations" and "Service role can manage violations" policies remain unchanged