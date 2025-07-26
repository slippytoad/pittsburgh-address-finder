-- Fix security issues: Update function with proper search_path
DROP FUNCTION IF EXISTS add_first_admin_user();

CREATE OR REPLACE FUNCTION add_first_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    first_user_id uuid;
BEGIN
    -- Get the first user from auth.users (assuming that's you)
    SELECT id INTO first_user_id 
    FROM auth.users 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    -- Insert them as admin if they exist and aren't already in user_roles
    IF first_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (first_user_id, 'admin'::public.app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END;
$$;