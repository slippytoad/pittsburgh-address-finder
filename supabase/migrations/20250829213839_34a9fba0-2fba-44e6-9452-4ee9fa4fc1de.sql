-- Fix security vulnerability: Remove overly permissive insert policy for violations table
-- This policy currently allows any authenticated user to insert violation records
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.violations;

-- The existing policies already provide appropriate access:
-- 1. "Admins can manage violations" - allows admins to insert/update/delete
-- 2. "Service role can manage violations" - allows service roles to manage violations
-- 3. "Authenticated users can read violations" - allows reading only

-- No additional insert policy needed since admins and service roles already have full access